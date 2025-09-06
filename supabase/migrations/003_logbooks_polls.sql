-- Group logbooks
CREATE TABLE logbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (length(title) > 0),
  content TEXT NOT NULL CHECK (length(content) > 0),
  meeting_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Polls for meetings
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (length(title) > 0),
  description TEXT,
  closes_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Ensure closes_at is in the future if specified
  CONSTRAINT valid_closes_at CHECK (closes_at IS NULL OR closes_at > created_at)
);

CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL CHECK (length(option_text) > 0),
  datetime TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE poll_votes (
  poll_option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (poll_option_id, user_id)
);