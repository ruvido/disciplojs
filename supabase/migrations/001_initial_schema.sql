-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user role enum
CREATE TYPE user_role AS ENUM ('admin', 'group_admin', 'member');

-- Create users table
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

-- Create groups table
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

-- Create group members table
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Create battleplans table
CREATE TABLE battleplans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  priority TEXT NOT NULL,
  priority_description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration INT CHECK (duration IN (30, 60, 90)),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create pillar type enum
CREATE TYPE pillar_type AS ENUM ('interiority', 'relationships', 'resources', 'health');

-- Create pillars table
CREATE TABLE pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battleplan_id UUID REFERENCES battleplans(id) ON DELETE CASCADE,
  type pillar_type NOT NULL,
  objective TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(battleplan_id, type)
);

-- Create routines table
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id UUID REFERENCES pillars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily',
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create routine logs table
CREATE TABLE routine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(routine_id, date)
);

-- Create logbook entries table
CREATE TABLE logbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meeting_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  closes_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create poll options table
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  datetime TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create poll votes table
CREATE TABLE poll_votes (
  poll_option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (poll_option_id, user_id)
);

-- Create battleplan templates table
CREATE TABLE battleplan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  priority_suggestion TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create template pillars table
CREATE TABLE template_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES battleplan_templates(id) ON DELETE CASCADE,
  type pillar_type NOT NULL,
  objective_suggestion TEXT,
  routines JSONB,
  UNIQUE(template_id, type)
);

-- Create function to auto-add approved users to main group
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

-- Create trigger for auto-add to main group
CREATE TRIGGER auto_add_to_main_group
AFTER UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION add_to_main_group();

-- Create unique index for one local group per user
CREATE UNIQUE INDEX one_local_group_per_user ON group_members(user_id) 
WHERE group_id IN (SELECT id FROM groups WHERE type = 'local');

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE battleplans ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE battleplan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_pillars ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view approved users" ON users
  FOR SELECT USING (approved = true OR auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for groups table
CREATE POLICY "Anyone can view groups" ON groups
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage groups" ON groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for battleplans
CREATE POLICY "Users can view their own battleplans" ON battleplans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own battleplans" ON battleplans
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own battleplans" ON battleplans
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own battleplans" ON battleplans
  FOR DELETE USING (user_id = auth.uid());