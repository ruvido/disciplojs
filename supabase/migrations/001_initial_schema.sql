-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users with roles
CREATE TYPE user_role AS ENUM ('admin', 'group_admin', 'member');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  name TEXT NOT NULL CHECK (length(name) > 0),
  bio TEXT,
  city TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'member',
  telegram_id TEXT UNIQUE,
  telegram_username TEXT,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  -- Ensure approved_at is set when approved is TRUE
  CONSTRAINT approved_at_consistency CHECK (
    (approved = FALSE AND approved_at IS NULL) OR 
    (approved = TRUE AND approved_at IS NOT NULL)
  )
);

-- Groups (including default main group)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(name) > 0),
  description TEXT,
  type TEXT CHECK (type IN ('main', 'local', 'online', 'special')),
  city TEXT,
  max_members INT DEFAULT 10 CHECK (max_members > 0),
  telegram_chat_id TEXT UNIQUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure only one default group exists at a time
CREATE UNIQUE INDEX unique_default_group ON groups(is_default) WHERE is_default = TRUE;

-- Group membership
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Auto-add approved users to main group
-- Function to set approved_at timestamp
CREATE OR REPLACE FUNCTION set_approved_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set approved_at when user is approved
  IF NEW.approved = TRUE AND OLD.approved = FALSE THEN
    NEW.approved_at = NOW();
  END IF;
  
  -- Clear approved_at when user is unapproved
  IF NEW.approved = FALSE AND OLD.approved = TRUE THEN
    NEW.approved_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to add approved users to main group
CREATE OR REPLACE FUNCTION add_to_main_group()
RETURNS TRIGGER AS $$
BEGIN
  -- Add to main group when user is approved
  IF NEW.approved = TRUE AND OLD.approved = FALSE THEN
    INSERT INTO group_members (group_id, user_id, role)
    SELECT id, NEW.id, 'member'
    FROM groups
    WHERE is_default = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set approved_at (BEFORE to modify the record)
CREATE TRIGGER set_approved_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_approved_at();

-- Trigger to add to main group (AFTER to access the committed record)
CREATE TRIGGER auto_add_to_main_group
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION add_to_main_group();

-- One local group per person rule
-- Note: This constraint will be enforced by application logic and triggers
-- since PostgreSQL doesn't support subqueries in partial index WHERE clauses

-- Create a function to enforce one local group per user
CREATE OR REPLACE FUNCTION enforce_one_local_group_per_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is trying to join a local group
  IF EXISTS (
    SELECT 1 FROM groups 
    WHERE id = NEW.group_id AND type = 'local'
  ) THEN
    -- Check if user is already in another local group
    IF EXISTS (
      SELECT 1 FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE gm.user_id = NEW.user_id
      AND g.type = 'local'
      AND gm.group_id != NEW.group_id
    ) THEN
      RAISE EXCEPTION 'User can only be in one local group at a time';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the constraint
CREATE TRIGGER check_one_local_group_per_user
BEFORE INSERT ON group_members
FOR EACH ROW
EXECUTE FUNCTION enforce_one_local_group_per_user();