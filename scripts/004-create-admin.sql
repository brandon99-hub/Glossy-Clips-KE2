-- Create admin user (password: admin123)
-- In production, use a secure password!
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$rQEY8tgKqH8yvQKqK8vPOOQ8YqF8vM8qP8qPqPqPqPqPqPqPqPqPq')
ON CONFLICT (username) DO NOTHING;
