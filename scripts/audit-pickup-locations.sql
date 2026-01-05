-- Final Audit Query for Pickup Mtaani Locations
-- Purpose: Manual review of proximity and accuracy of scraped data

SELECT 
    id, 
    agent_id, 
    name, 
    area, 
    zone, 
    latitude, 
    longitude, 
    google_maps_url,
    description,
    last_scraped_at
FROM pickup_mtaani_locations 
WHERE is_active = true 
ORDER BY area ASC, name ASC;
