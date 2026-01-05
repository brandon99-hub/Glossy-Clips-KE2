#!/usr/bin/env tsx

/**
 * Pickup Mtaani Location Scraper Script
 * 
 * This script scrapes all agent locations from Pickup Mtaani website
 * and syncs them to the database.
 * 
 * Usage:
 *   npm run scrape:pickup-locations              # Full scrape and sync
 *   npm run scrape:pickup-locations -- --dry-run # Test without DB writes
 *   npm run scrape:pickup-locations -- --limit 10 # Scrape only first 10
 */

// Load environment variables first
import { config } from 'dotenv';
config();

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.error('Please check your .env file contains DATABASE_URL');
    process.exit(1);
}

import { sql } from '@/lib/db';
import { PickupMtaaniScraper } from '@/lib/scrapers/pickup-mtaani-scraper';
import { pickupMtaaniClient } from '@/lib/pickup-mtaani';

interface ScriptOptions {
    dryRun: boolean;
    limit?: number;
}

async function parseArgs(): Promise<ScriptOptions> {
    const args = process.argv.slice(2);
    return {
        dryRun: args.includes('--dry-run'),
        limit: args.includes('--limit')
            ? parseInt(args[args.indexOf('--limit') + 1])
            : undefined,
    };
}

async function syncToDatabase(locations: any[], dryRun: boolean) {
    if (dryRun) {
        console.log('\n[DRY RUN] Would sync the following locations to database:');
        locations.slice(0, 5).forEach(loc => {
            console.log(`  - ${loc.name} (${loc.area}): ${loc.latitude}, ${loc.longitude}`);
        });
        if (locations.length > 5) {
            console.log(`  ... and ${locations.length - 5} more`);
        }
        return { inserted: 0, updated: 0 };
    }

    console.log('\n[Database] Syncing locations to database...');

    let inserted = 0;
    let updated = 0;

    for (const loc of locations) {
        try {
            // Convert 0 coordinates to NULL for agents without GPS
            const latitude = loc.latitude === 0 ? null : loc.latitude;
            const longitude = loc.longitude === 0 ? null : loc.longitude;
            const mapsUrl = loc.google_maps_url || null;

            // Calculate proper fee for this location
            const deliveryFee = pickupMtaaniClient.calculateLocalFee(
                'TMALL(LANGATA RD)',
                loc.area || 'Unknown',
                'small'
            );

            // Upsert: insert or update if agent_id already exists
            const result = await sql`
        INSERT INTO pickup_mtaani_locations (
          agent_id, 
          name, 
          area, 
          zone,
          description,
          latitude, 
          longitude, 
          google_maps_url,
          delivery_fee,
          is_active,
          data_source,
          last_scraped_at
        ) VALUES (
          ${loc.agent_id},
          ${loc.name},
          ${loc.area},
          ${loc.area}, -- Use area as zone for now
          ${loc.description},
          ${latitude},
          ${longitude},
          ${mapsUrl},
          ${deliveryFee},
          true,
          'scraped',
          NOW()
        )
        ON CONFLICT (agent_id) 
        DO UPDATE SET
          name = EXCLUDED.name,
          area = EXCLUDED.area,
          zone = EXCLUDED.zone,
          description = EXCLUDED.description,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          google_maps_url = EXCLUDED.google_maps_url,
          delivery_fee = EXCLUDED.delivery_fee,
          is_active = EXCLUDED.is_active,
          data_source = EXCLUDED.data_source,
          last_scraped_at = EXCLUDED.last_scraped_at,
          updated_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;

            if (result[0]?.inserted) {
                inserted++;
            } else {
                updated++;
            }
        } catch (error) {
            console.error(`[Database] Error syncing ${loc.name}:`, error);
        }
    }

    console.log(`[Database] Sync complete: ${inserted} inserted, ${updated} updated`);
    return { inserted, updated };
}

async function main() {
    const options = await parseArgs();

    console.log('='.repeat(60));
    console.log('Pickup Mtaani Location Scraper');
    console.log('='.repeat(60));
    console.log(`Mode: ${options.dryRun ? 'DRY RUN (no database writes)' : 'LIVE'}`);
    if (options.limit) {
        console.log(`Limit: First ${options.limit} agents only`);
    }
    console.log('='.repeat(60));
    console.log('');


    try {
        // Load existing agents from database to implement incremental scraping
        console.log('[Database] Loading existing agents for incremental check...');
        const existingAgents = await sql`
            SELECT agent_id, latitude 
            FROM pickup_mtaani_locations 
            WHERE data_source = 'scraped'
        `;

        const agentMap = new Map(existingAgents.map(a => [a.agent_id?.toString() || '', a]));
        console.log(`[Database] Found ${existingAgents.length} agents in DB`);

        // Scrape locations
        console.log('[Scraper] Starting scrape...');
        const scraper = new PickupMtaaniScraper({
            headless: true,
            rateLimit: 1000,
        });

        await scraper.init();
        const startTime = Date.now();

        // Step 1: Get the list of all agents from the main page
        const fullAgentList = await scraper.scrapeAgentList();

        // Step 2: Filter for incremental scraping
        let agentsToScrape = fullAgentList.filter(agent => {
            const existing = agentMap.get(agent.id);

            // Scrape if not in DB
            if (!existing) return true;

            // Scrape if missing GPS (maybe they updated it)
            if (existing.latitude === null) return true;

            // Otherwise skip
            return false;
        });

        console.log(`[Scraper] Incremental status: ${agentsToScrape.length} new or incomplete agents to scrape (out of ${fullAgentList.length} total)`);

        // Apply limit if specified
        if (options.limit) {
            agentsToScrape = agentsToScrape.slice(0, options.limit);
        }

        const scrapedLocations: any[] = [];

        // Step 3: Scrape details only for the filtered list
        for (let i = 0; i < agentsToScrape.length; i++) {
            const agent = agentsToScrape[i];
            console.log(`[Scraper] [${i + 1}/${agentsToScrape.length}] Scraping details for: ${agent.name}`);

            const details = await scraper.scrapeAgentDetails(agent.id, agent.name);
            if (details) {
                scrapedLocations.push(details);
                if (details.latitude !== 0) {
                    console.log(`  ✓ Got GPS: ${details.latitude}, ${details.longitude}`);
                }
            }

            // Rate limit internally handled by loop but adding backup delay if needed
            // Actually the scraper class has rateLimit option, but we are calling scrapeAgentDetails manually
            if (i < agentsToScrape.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        await scraper.close();

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        // Calculate GPS statistics for newly scraped
        const newlyWithGPS = scrapedLocations.filter(l => l.latitude !== 0 && l.longitude !== 0).length;

        console.log('');
        console.log('='.repeat(60));
        console.log(`[Scraper] Incremental scrape complete in ${duration}s`);
        console.log(`[Scraper] Newly processed: ${scrapedLocations.length}`);
        console.log(`[Scraper] Newly found GPS: ${newlyWithGPS}`);
        console.log('='.repeat(60));

        // Sync to database
        const { inserted, updated } = await syncToDatabase(scrapedLocations, options.dryRun);

        // Final count check
        const finalStats = await sql`SELECT COUNT(*) as count, COUNT(latitude) as with_gps FROM pickup_mtaani_locations WHERE data_source = 'scraped'`;

        // Summary
        console.log('');
        console.log('='.repeat(60));
        console.log('FINAL DATABASE SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total agents in DB: ${finalStats[0].count}`);
        console.log(`Agents with GPS: ${finalStats[0].with_gps}`);
        console.log(`Agents without GPS: ${Number(finalStats[0].count) - Number(finalStats[0].with_gps)}`);
        console.log(`New inserts: ${inserted}`);
        console.log(`Updates: ${updated}`);
        console.log(`Scrape Duration: ${duration}s`);
        console.log('='.repeat(60));

        if (options.dryRun) {
            console.log('\n✓ DRY RUN COMPLETE - No changes made to database');
        } else {
            console.log('\n✓ SYNC COMPLETE - Database is up to date');
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error);
        process.exit(1);
    }
}

// Run the script
main().catch(console.error);
