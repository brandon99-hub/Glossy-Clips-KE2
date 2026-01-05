-- SEQUENTIAL SPLITTER CLEANUP
-- This version uses simple string splitting to avoid regex quirks.

BEGIN;

-- 1. Cut at 'View on Google Maps'
UPDATE pickup_mtaani_locations 
SET description = TRIM(SPLIT_PART(description, 'View on Google Maps', 1))
WHERE description LIKE '%View on Google Maps%';

-- 2. Cut at 'Pickup Mtaani'
UPDATE pickup_mtaani_locations 
SET description = TRIM(SPLIT_PART(description, 'Pickup Mtaani', 1))
WHERE description LIKE '%Pickup Mtaani%';

-- 3. Cut at 'self.__next_f'
UPDATE pickup_mtaani_locations 
SET description = TRIM(SPLIT_PART(description, 'self.__next_f', 1))
WHERE description LIKE '%self.__next_f%';

-- 4. Cut at 'All rights reserved'
UPDATE pickup_mtaani_locations 
SET description = TRIM(SPLIT_PART(description, 'All rights reserved', 1))
WHERE description LIKE '%All rights reserved%';

-- 5. Cleanup names from junk suffix
UPDATE pickup_mtaani_locations 
SET name = TRIM(SPLIT_PART(name, 'Pickup Mtaani', 1))
WHERE name LIKE '%Pickup Mtaani%';

-- 6. FINAL TRIM
UPDATE pickup_mtaani_locations SET name = TRIM(name), description = TRIM(description);

-- 7. VERIFICATION QUERY - RUN TO SEE WHAT'S STILL LONG
SELECT name, area, LENGTH(description) as len, description 
FROM pickup_mtaani_locations 
WHERE LENGTH(description) > 200 
ORDER BY len DESC;

COMMIT;
