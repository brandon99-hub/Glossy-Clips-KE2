/**
 * Pickup Mtaani Location Scraper
 * 
 * This module provides functionality to scrape agent locations from
 * the Pickup Mtaani website and extract GPS coordinates.
 */

import puppeteer, { Browser, Page } from 'puppeteer';

export interface AgentLocation {
    agent_id: string;
    name: string;
    area: string;
    description: string;
    latitude: number;
    longitude: number;
    google_maps_url: string;
}

export interface ScraperOptions {
    headless?: boolean;
    timeout?: number;
    rateLimit?: number; // milliseconds between requests
}

export class PickupMtaaniScraper {
    private browser: Browser | null = null;
    private options: Required<ScraperOptions>;

    constructor(options: ScraperOptions = {}) {
        this.options = {
            headless: options.headless ?? true,
            timeout: options.timeout ?? 30000,
            rateLimit: options.rateLimit ?? 1000, // 1 second between requests
        };
    }

    /**
     * Initialize the browser
     */
    async init(): Promise<void> {
        console.log('[Scraper] Launching browser...');
        this.browser = await puppeteer.launch({
            headless: this.options.headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    }

    /**
     * Close the browser
     */
    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    /**
     * Extract coordinates from Google Maps URL
     * Format: https://www.google.com/maps?q=-1.2468965,36.8708378
     */
    private extractCoordinates(mapsUrl: string): { lat: number; lng: number } | null {
        const match = mapsUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);

        if (!match) {
            console.warn(`[Scraper] Could not extract coordinates from: ${mapsUrl}`);
            return null;
        }

        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);

        // Validate coordinates are within Kenya bounds
        if (lat < -4.7 || lat > 4.6 || lng < 33.9 || lng > 41.9) {
            console.warn(`[Scraper] Coordinates out of Kenya bounds: ${lat}, ${lng}`);
            return null;
        }

        return { lat, lng };
    }

    /**
     * Scrape the list of all agent IDs and names from the main agents page
     */
    async scrapeAgentList(): Promise<Array<{ id: string; name: string }>> {
        if (!this.browser) {
            throw new Error('Browser not initialized. Call init() first.');
        }

        console.log('[Scraper] Fetching agent list...');
        const page = await this.browser.newPage();

        try {
            await page.goto('https://new.pickupmtaani.com/agents', {
                waitUntil: 'networkidle2',
                timeout: this.options.timeout,
            });

            // Wait for the details elements to be present (indicates page is loaded)
            await page.waitForSelector('details', { timeout: 10000 });

            // Give it a moment for any client-side rendering
            await this.sleep(2000);

            // Extract all agent links
            const agents = await page.$$eval('a[href^="/agent/"]', (links) =>
                links.map((link) => ({
                    id: link.getAttribute('href')?.split('/agent/')[1] || '',
                    name: link.textContent?.trim() || '',
                }))
            );

            // Remove duplicates (same agent might appear multiple times)
            const uniqueAgents = Array.from(
                new Map(agents.map(a => [a.id, a])).values()
            );

            console.log(`[Scraper] Found ${uniqueAgents.length} unique agents`);
            return uniqueAgents;
        } finally {
            await page.close();
        }
    }

    /**
     * Scrape details for a single agent
     */
    async scrapeAgentDetails(agentId: string, agentName: string): Promise<AgentLocation | null> {
        if (!this.browser) {
            throw new Error('Browser not initialized. Call init() first.');
        }

        const page = await this.browser.newPage();

        try {
            const url = `https://new.pickupmtaani.com/agent/${agentId}`;
            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: this.options.timeout,
            });

            // Extract details structurally using the identified h5 pattern
            const details = await page.evaluate((name) => {
                const results = {
                    name: name,
                    area: 'Nairobi',
                    description: '',
                };

                // Find all rows
                const rows = Array.from(document.querySelectorAll('div.flex.flex-col.gap-4'));

                rows.forEach(row => {
                    const labelEl = row.querySelector('h5.font-bold');
                    const valueEl = row.querySelector('h5.text-base:not(.font-bold)');

                    if (labelEl && valueEl) {
                        const label = labelEl.textContent?.trim().toLowerCase();
                        const value = valueEl.textContent?.trim();

                        if (label?.includes('name:')) {
                            results.name = value || name;
                        } else if (label?.includes('location:')) {
                            results.area = value || 'Nairobi';
                        } else if (label?.includes('description:')) {
                            results.description = value || '';
                        }
                    }
                });

                return results;
            }, agentName);

            const area = details.area;
            const description = details.description;
            const finalName = details.name;

            // Try to extract Google Maps URL (optional now)
            const mapsUrl = await page.$eval(
                'a[href*="google.com/maps"]',
                (el) => el.getAttribute('href') || ''
            ).catch(() => null);

            let coords = null;
            if (mapsUrl) {
                // Extract coordinates if Maps URL exists
                coords = this.extractCoordinates(mapsUrl);
            }

            // Sanitization helper - Cuts off trailing junk systematically
            const sanitize = (text: string) => {
                if (!text) return '';

                let clean = text;
                const junkMarkers = [
                    'Pickup Mtaani',
                    'self.__next_f',
                    'All rights reserved',
                    'Privacy Policy',
                    'View on Google Maps'
                ];

                for (const marker of junkMarkers) {
                    if (clean.includes(marker)) {
                        clean = clean.split(marker)[0];
                    }
                }

                return clean.trim();
            };

            const cleanName = sanitize(agentName);
            const cleanArea = sanitize(area);
            const cleanDescription = sanitize(description);

            if (!mapsUrl || !coords) {
                console.warn(`[Scraper] No GPS coordinates for agent ${agentId} - ${cleanName}`);
                return {
                    agent_id: agentId,
                    name: cleanName,
                    area: cleanArea,
                    description: cleanDescription,
                    latitude: 0,
                    longitude: 0,
                    google_maps_url: '',
                };
            }

            // Return with full GPS data
            return {
                agent_id: agentId,
                name: cleanName,
                area: cleanArea,
                description: cleanDescription,
                latitude: coords.lat,
                longitude: coords.lng,
                google_maps_url: mapsUrl,
            };
        } catch (error) {
            console.error(`[Scraper] Error scraping agent ${agentId}:`, error);
            return null;
        } finally {
            await page.close();
        }
    }

    /**
     * Scrape all agents with rate limiting
     */
    async scrapeAllAgents(
        onProgress?: (current: number, total: number, agent: AgentLocation | null) => void
    ): Promise<AgentLocation[]> {
        const agentList = await this.scrapeAgentList();
        const results: AgentLocation[] = [];

        console.log(`[Scraper] Starting to scrape ${agentList.length} agents...`);

        for (let i = 0; i < agentList.length; i++) {
            const agent = agentList[i];
            console.log(`[Scraper] [${i + 1}/${agentList.length}] Scraping: ${agent.name}`);

            const details = await this.scrapeAgentDetails(agent.id, agent.name);

            if (details) {
                results.push(details);
            }

            if (onProgress) {
                onProgress(i + 1, agentList.length, details);
            }

            // Rate limiting - wait before next request
            if (i < agentList.length - 1) {
                await this.sleep(this.options.rateLimit);
            }
        }

        console.log(`[Scraper] Successfully scraped ${results.length}/${agentList.length} agents`);
        return results;
    }

    /**
     * Sleep utility
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Convenience function to scrape all locations
 */
export async function scrapePickupMtaaniLocations(
    options?: ScraperOptions
): Promise<AgentLocation[]> {
    const scraper = new PickupMtaaniScraper(options);

    try {
        await scraper.init();
        const locations = await scraper.scrapeAllAgents((current, total, agent) => {
            if (agent) {
                console.log(`  ✓ ${agent.name} - ${agent.area} (${agent.latitude}, ${agent.longitude})`);
            }
        });
        return locations;
    } finally {
        await scraper.close();
    }
}
