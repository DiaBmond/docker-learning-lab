-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    network_demo VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email, network_demo) VALUES
    ('Alice', 'alice@example.com', 'Private Network'),
    ('Bob', 'bob@example.com', 'Private Network'),
    ('Charlie', 'charlie@example.com', 'Private Network'),
    ('Diana', 'diana@example.com', 'Private Network')
ON CONFLICT (email) DO NOTHING;

-- Show inserted data
SELECT * FROM users;