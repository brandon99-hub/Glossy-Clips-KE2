-- Comprehensive Geospatial Fee Correction for Pickup Mtaani Locations
-- Fixed Ranges Strategy (Min - Max):
-- CBD: 100 - 150 KES
-- Local Estates: 180 - 250 KES
-- Outer Metro/Outskirts: 250 - 300 KES
-- Upcountry: 290 - 450 KES

-- 0. Ensure Columns Exist
ALTER TABLE pickup_mtaani_locations 
ADD COLUMN IF NOT EXISTS delivery_fee_min DECIMAL(10,2) DEFAULT 180.00,
ADD COLUMN IF NOT EXISTS delivery_fee_max DECIMAL(10,2) DEFAULT 250.00;

BEGIN;

-- 1. Default for all: 180 - 250 KES (Local)
UPDATE pickup_mtaani_locations
SET 
    delivery_fee = 180,
    delivery_fee_min = 180,
    delivery_fee_max = 250;

-- 2. CBD Hubs (Nairobi Town)
UPDATE pickup_mtaani_locations
SET 
    delivery_fee = 100,
    delivery_fee_min = 100,
    delivery_fee_max = 150
WHERE area ILIKE '%CBD - TOWN NAIROBI%' 
   OR area ILIKE '%TOWN NAIROBI%';

-- 3. Outer Metro / Outskirts (250 - 300 KES)
UPDATE pickup_mtaani_locations
SET 
    delivery_fee = 250,
    delivery_fee_min = 250,
    delivery_fee_max = 300
WHERE area ILIKE '%ATHI RIVER%'
   OR area ILIKE '%ATHIRIVER%'
   OR area ILIKE '%SYOKIMAU%'
   OR area ILIKE '%KITENGELA%'
   OR area ILIKE '%RUAKA%'
   OR area ILIKE '%KIKUYU%'
   OR area ILIKE '%BANANA%'
   OR area ILIKE '%NGONG%'
   OR area ILIKE '%RONGAI%'
   OR area ILIKE '%RUAI%'
   OR area ILIKE '%UTAWALA%'
   OR area ILIKE '%MLOLONGO%'
   OR area ILIKE '%GREAT WALL%'
   OR area ILIKE '%MACHAKOS%'
   OR area ILIKE '%LIMURU%';

-- 4. Upcountry / Countrywide (290 - 450 KES)
UPDATE pickup_mtaani_locations
SET 
    delivery_fee = 290,
    delivery_fee_min = 290,
    delivery_fee_max = 450
WHERE area ILIKE '%MOMBASA%'
   OR area ILIKE '%ELDORET%'
   OR area ILIKE '%NAKURU%'
   OR area ILIKE '%KAKAMEGA%'
   OR area ILIKE '%KILIFI%'
   OR area ILIKE '%NANYUKI%'
   OR area ILIKE '%KISUMU%'
   OR area ILIKE '%KISII%'
   OR area ILIKE '%MALINDI%'
   OR area ILIKE '%DIANI%'
   OR area ILIKE '%LAMU%'
   OR area ILIKE '%WATAMU%'
   OR area ILIKE '%MERU%'
   OR area ILIKE '%NYERI%'
   OR area ILIKE '%EMBU%'
   OR area ILIKE '%KERICHO%'
   OR area ILIKE '%BOMET%'
   OR area ILIKE '%KITALE%'
   OR area ILIKE '%BAMBURI%'
   OR area ILIKE '%SHANZU%'
   OR area ILIKE '%MTWAPA%'
   OR area ILIKE '%MIRITINI%'
   OR area ILIKE '%JOMVU%'
   OR area ILIKE '%CHAANI%'
   OR area ILIKE '%MAGONGO%'
   OR area ILIKE '%MIKINDANI%'
   OR area ILIKE '%TUDOR%'
   OR area ILIKE '%MAKUPA%'
   OR area ILIKE '%NYALI%'
   OR area ILIKE '%MSHOMORONI%'
   OR area ILIKE '%BAKARANI%'
   OR area ILIKE '%BOMBOLULU%'
   OR area ILIKE '%SABAKI%';

-- 5. Special Case: Joggers Hub (Internal/Collection)
UPDATE pickup_mtaani_locations
SET 
    delivery_fee = 100,
    delivery_fee_min = 100,
    delivery_fee_max = 120
WHERE area ILIKE '%TMALL%' OR name ILIKE '%Thejoggers hub%';

COMMIT;

-- Verify results
SELECT area, name, delivery_fee_min, delivery_fee_max 
FROM pickup_mtaani_locations 
ORDER BY delivery_fee_min ASC;
