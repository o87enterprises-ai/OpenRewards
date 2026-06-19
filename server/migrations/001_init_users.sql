-- Minimal users table for the OpenRewards demo's own auth. If you're
-- integrating OpenRewards into an app that already has a users table, skip
-- this migration and point 002's foreign keys at your existing table/PK.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
