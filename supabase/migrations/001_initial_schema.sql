-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users with roles
CREATE TYPE user_role AS ENUM ('admin', 'group_admin', 'member');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  city TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'member',
  telegram_id TEXT UNIQUE,
  telegram_username TEXT,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Groups (including default main group)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('main', 'local', 'online', 'special')),
  city TEXT,
  max_members INT DEFAULT 10,
  telegram_chat_id TEXT UNIQUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Group membership
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Auto-add approved users to main group
CREATE OR REPLACE FUNCTION add_to_main_group()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approved = TRUE AND OLD.approved = FALSE THEN
    INSERT INTO group_members (group_id, user_id, role)
    SELECT id, NEW.id, 'member'
    FROM groups
    WHERE is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_add_to_main_group
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION add_to_main_group();

-- One local group per person rule
CREATE UNIQUE INDEX one_local_group_per_user ON group_members(user_id) 
WHERE group_id IN (SELECT id FROM groups WHERE type = 'local');