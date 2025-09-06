-- Battleplans
CREATE TABLE battleplans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) > 0),
  priority TEXT NOT NULL CHECK (length(priority) > 0),
  priority_description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration INT CHECK (duration IN (30, 60, 90)),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Ensure end_date is after start_date
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  -- Ensure duration matches the actual date difference (approximately)
  CONSTRAINT duration_matches_dates CHECK (
    duration = CASE 
      WHEN (end_date - start_date) BETWEEN 28 AND 32 THEN 30
      WHEN (end_date - start_date) BETWEEN 58 AND 62 THEN 60
      WHEN (end_date - start_date) BETWEEN 88 AND 92 THEN 90
      ELSE duration -- Allow some flexibility for edge cases
    END
  )
);

-- Pillars (4 per battleplan)
CREATE TYPE pillar_type AS ENUM ('interiority', 'relationships', 'resources', 'health');

CREATE TABLE pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battleplan_id UUID REFERENCES battleplans(id) ON DELETE CASCADE,
  type pillar_type NOT NULL,
  objective TEXT NOT NULL CHECK (length(objective) > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(battleplan_id, type)
);

-- Routines
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id UUID REFERENCES pillars(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) > 0),
  description TEXT,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  order_index INT DEFAULT 0 CHECK (order_index >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Routine tracking
CREATE TABLE routine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(routine_id, date)
);

-- Battleplan templates
CREATE TABLE battleplan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(name) > 0),
  description TEXT,
  priority_suggestion TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE template_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES battleplan_templates(id) ON DELETE CASCADE,
  type pillar_type NOT NULL,
  objective_suggestion TEXT,
  routines JSONB, -- Array of routine suggestions
  UNIQUE(template_id, type)
);