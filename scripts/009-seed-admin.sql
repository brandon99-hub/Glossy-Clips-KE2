-- Seed admin user
-- Username: Bianca B
-- Password: Oreosdonut

INSERT INTO admin_users (username, password_hash, created_at)
VALUES (
    'Bianca B',
    '$2b$10$AH8tyiwJCGhauJp4sfHv8ex0fmE/gAPheqmnsnloss3eJ90IAIvyO',
    NOW()
)
ON CONFLICT (username) DO NOTHING;
