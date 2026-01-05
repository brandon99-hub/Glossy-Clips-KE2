-- Fix hardcoded 300 KES delivery fees to reflect official Pickup Mtaani zones
-- Relative to Joggers Hub (TMALL)

UPDATE pickup_mtaani_locations
SET delivery_fee = CASE
    -- 1. CBD / Hub Routes (100 KES)
    WHEN area ILIKE '%cbd%' 
      OR area ILIKE '%central%' 
      OR area ILIKE '%hub%' 
      OR name ILIKE '%star-mall%' 
    THEN 100

    -- 2. Countrywide / Major Towns (290 KES Base)
    WHEN area ILIKE '%mombasa%' 
      OR area ILIKE '%kisumu%' 
      OR area ILIKE '%nakuru%' 
      OR area ILIKE '%eldoret%' 
      OR area ILIKE '%kisii%' 
      OR area ILIKE '%kakamega%' 
      OR area ILIKE '%malindi%' 
      OR area ILIKE '%diani%' 
      OR area ILIKE '%kilifi%' 
      OR area ILIKE '%lamu%' 
      OR area ILIKE '%watamu%' 
      OR area ILIKE '%nanyuki%' 
      OR area ILIKE '%meru%' 
      OR area ILIKE '%nyeri%' 
      OR area ILIKE '%embu%' 
      OR area ILIKE '%kericho%' 
      OR area ILIKE '%bomet%' 
      OR area ILIKE '%kitale%' 
    THEN 290

    -- 3. Mashinani / Outer Metro (250 KES)
    WHEN area ILIKE '%mashinani%' 
      OR area ILIKE '%outer%' 
      OR area ILIKE '%thika%' 
      OR area ILIKE '%kitengela%' 
      OR area ILIKE '%machakos%' 
      OR area ILIKE '%kajiado%' 
      OR area ILIKE '%banana%' 
      OR area ILIKE '%ruaka%' 
      OR area ILIKE '%athi river%' 
    THEN 250

    -- 4. Default Nairobi Mtaani (180 KES)
    ELSE 180
END
WHERE data_source = 'scraped' OR delivery_fee = 300;

-- Verification Query
SELECT area, name, delivery_fee 
FROM pickup_mtaani_locations 
WHERE delivery_fee != 300 
ORDER BY delivery_fee ASC 
LIMIT 20;
