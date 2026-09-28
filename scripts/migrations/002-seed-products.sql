-- Updated categories from 'hair-charm' to 'hair-clip' to match GLOSSYCLIPSKE branding
-- Seed hair clips
INSERT INTO products (name, slug, description, price, category, images) VALUES
(
  'Gold Claw Clip',
  'gold-claw-clip',
  'Elegant gold claw clip perfect for everyday glam. Holds all hair types.',
  450.00,
  'hair-clip',
  ARRAY['/gold-hair-claw-clip.jpg']
),
(
  'Pearl Hair Pins Set',
  'pearl-hair-pins',
  'Set of 5 delicate pearl hair pins for that soft glam look.',
  350.00,
  'hair-clip',
  ARRAY['/pearl-hair-pins-set.jpg']
),
(
  'Butterfly Clips Pack',
  'butterfly-clips-pack',
  'Pack of 6 colorful butterfly clips. 90s vibes are back!',
  280.00,
  'hair-clip',
  ARRAY['/colorful-butterfly-hair-clips.jpg']
),
(
  'Satin Scrunchie Set',
  'satin-scrunchie-set',
  'Set of 3 satin scrunchies in pink, brown, and beige. Gentle on your hair.',
  400.00,
  'hair-clip',
  ARRAY['/satin-scrunchies-pink-brown-beige.jpg']
),
(
  'Crystal Hair Cuffs',
  'crystal-hair-cuffs',
  'Sparkling crystal cuffs for braids and locs. Set of 6.',
  550.00,
  'hair-clip',
  ARRAY['/placeholder.svg?height=400&width=400']
);

-- Seed lip glosses
INSERT INTO products (name, slug, description, price, category, images) VALUES
(
  'Summer Fridays Lip Butter - Vanilla',
  'lip-butter-vanilla',
  'Hydrating lip butter with a hint of vanilla. Gives the perfect glossy, plump look.',
  1200.00,
  'gloss',
  ARRAY['/summer-fridays-vanilla-lip-gloss-pink-tube.jpg']
),
(
  'Summer Fridays Lip Butter - Cherry',
  'lip-butter-cherry',
  'Sweet cherry tint with buildable color. Smells amazing.',
  1200.00,
  'gloss',
  ARRAY['/summer-fridays-cherry-lip-gloss.jpg']
),
(
  'Summer Fridays Lip Butter - Berry',
  'lip-butter-berry',
  'Deep berry tint for a bold, juicy look. Perfect for evenings.',
  1200.00,
  'gloss',
  ARRAY['/placeholder.svg?height=400&width=400']
),
(
  'Summer Fridays Dream Oasis Serum',
  'dream-oasis-serum',
  'Lightweight hydrating serum for that dewy, glass skin look.',
  2500.00,
  'gloss',
  ARRAY['/placeholder.svg?height=400&width=400']
);

-- Seed secret menu items
INSERT INTO products (name, slug, description, price, category, images, is_secret) VALUES
(
  'Limited Edition: Gold Clip Bundle',
  'gold-bundle-secret',
  'Exclusive bundle with 3 gold clips + mystery gift. Only for secret menu members.',
  1500.00,
  'hair-clip',
  ARRAY['/placeholder.svg?height=400&width=400'],
  TRUE
),
(
  'Unreleased: Summer Fridays Glow Drops',
  'glow-drops-secret',
  'Coming soon to the main shop. Get it first here.',
  1800.00,
  'gloss',
  ARRAY['/placeholder.svg?height=400&width=400'],
  TRUE
);
