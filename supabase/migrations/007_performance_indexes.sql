-- Performance indexes for frequently queried columns

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id) WHERE telegram_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email); -- For login lookups
CREATE INDEX IF NOT EXISTS idx_users_approved_at ON users(approved_at) WHERE approved_at IS NOT NULL;

-- Groups table indexes  
CREATE INDEX IF NOT EXISTS idx_groups_is_default ON groups(is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_groups_telegram_chat_id ON groups(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;

-- Group members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);

-- Battleplans indexes
CREATE INDEX IF NOT EXISTS idx_battleplans_user_id ON battleplans(user_id);
CREATE INDEX IF NOT EXISTS idx_battleplans_is_active ON battleplans(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_battleplans_start_date ON battleplans(start_date);
CREATE INDEX IF NOT EXISTS idx_battleplans_end_date ON battleplans(end_date);

-- Pillars indexes
CREATE INDEX IF NOT EXISTS idx_pillars_battleplan_id ON pillars(battleplan_id);
CREATE INDEX IF NOT EXISTS idx_pillars_type ON pillars(type);

-- Routines indexes
CREATE INDEX IF NOT EXISTS idx_routines_pillar_id ON routines(pillar_id);
CREATE INDEX IF NOT EXISTS idx_routines_order_index ON routines(order_index);

-- Routine logs indexes
CREATE INDEX IF NOT EXISTS idx_routine_logs_routine_id ON routine_logs(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_logs_user_id ON routine_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_logs_date ON routine_logs(date);
CREATE INDEX IF NOT EXISTS idx_routine_logs_completed ON routine_logs(completed);
CREATE INDEX IF NOT EXISTS idx_routine_logs_user_date ON routine_logs(user_id, date);

-- Logbook entries indexes
CREATE INDEX IF NOT EXISTS idx_logbook_entries_group_id ON logbook_entries(group_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_author_id ON logbook_entries(author_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_meeting_date ON logbook_entries(meeting_date) WHERE meeting_date IS NOT NULL;

-- Polls indexes
CREATE INDEX IF NOT EXISTS idx_polls_group_id ON polls(group_id);
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_closes_at ON polls(closes_at) WHERE closes_at IS NOT NULL;

-- Poll options indexes
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id);

-- Poll votes indexes
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);

-- Template indexes
CREATE INDEX IF NOT EXISTS idx_battleplan_templates_is_public ON battleplan_templates(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_battleplan_templates_created_by ON battleplan_templates(created_by);

-- Template pillars indexes
CREATE INDEX IF NOT EXISTS idx_template_pillars_template_id ON template_pillars(template_id);
CREATE INDEX IF NOT EXISTS idx_template_pillars_type ON template_pillars(type);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_battleplans_user_active ON battleplans(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_group_members_group_role ON group_members(group_id, role);
CREATE INDEX IF NOT EXISTS idx_routine_logs_user_completed_date ON routine_logs(user_id, completed, date);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_template_pillars_routines_gin ON template_pillars USING GIN (routines);