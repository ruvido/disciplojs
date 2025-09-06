-- Enable RLS on all tables
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

-- Users policies
CREATE POLICY "Users can view approved users" ON users
  FOR SELECT USING (approved = true OR auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can do everything" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Groups policies
CREATE POLICY "Anyone can view groups" ON groups
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage groups" ON groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Group members policies
CREATE POLICY "Members can view group members" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Group admins can manage members" ON group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id::text = auth.uid()::text 
      AND gm.role = 'admin'
    )
  );

-- Battleplans policies
CREATE POLICY "Users can view own battleplans" ON battleplans
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create own battleplans" ON battleplans
  FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own battleplans" ON battleplans
  FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own battleplans" ON battleplans
  FOR DELETE USING (user_id::text = auth.uid()::text);

-- Group members can view each other's active battleplans
CREATE POLICY "Group members can view group battleplans" ON battleplans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.user_id = battleplans.user_id
      AND gm2.user_id::text = auth.uid()::text
      AND battleplans.is_active = true
    )
  );

-- Pillars policies (inherit from battleplan)
CREATE POLICY "Pillars follow battleplan permissions" ON pillars
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM battleplans 
      WHERE battleplans.id = pillars.battleplan_id 
      AND battleplans.user_id::text = auth.uid()::text
    )
  );

-- Routines policies (inherit from pillars)
CREATE POLICY "Routines follow pillar permissions" ON routines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pillars 
      JOIN battleplans ON battleplans.id = pillars.battleplan_id
      WHERE pillars.id = routines.pillar_id 
      AND battleplans.user_id::text = auth.uid()::text
    )
  );

-- Routine logs policies
CREATE POLICY "Users can manage own routine logs" ON routine_logs
  FOR ALL USING (user_id::text = auth.uid()::text);

-- Logbook policies
CREATE POLICY "Group members can view logbooks" ON logbook_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = logbook_entries.group_id 
      AND user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Group admins can create logbook entries" ON logbook_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = logbook_entries.group_id 
      AND user_id::text = auth.uid()::text 
      AND role = 'admin'
    )
    AND author_id::text = auth.uid()::text
  );

CREATE POLICY "Authors can update own logbook entries" ON logbook_entries
  FOR UPDATE USING (author_id::text = auth.uid()::text);

-- Polls policies
CREATE POLICY "Group members can view polls" ON polls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = polls.group_id 
      AND user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Group admins can create polls" ON polls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = polls.group_id 
      AND user_id::text = auth.uid()::text 
      AND role = 'admin'
    )
    AND created_by::text = auth.uid()::text
  );

-- Poll options policies (inherit from polls)
CREATE POLICY "Poll options follow poll permissions" ON poll_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM polls 
      JOIN group_members ON group_members.group_id = polls.group_id
      WHERE polls.id = poll_options.poll_id 
      AND group_members.user_id::text = auth.uid()::text
    )
  );

-- Poll votes policies
CREATE POLICY "Group members can vote" ON poll_votes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM poll_options
      JOIN polls ON polls.id = poll_options.poll_id
      JOIN group_members ON group_members.group_id = polls.group_id
      WHERE poll_options.id = poll_votes.poll_option_id
      AND group_members.user_id::text = auth.uid()::text
    )
  );

-- Templates policies
CREATE POLICY "Anyone can view public templates" ON battleplan_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create templates" ON battleplan_templates
  FOR INSERT WITH CHECK (created_by::text = auth.uid()::text);

CREATE POLICY "Users can manage own templates" ON battleplan_templates
  FOR ALL USING (created_by::text = auth.uid()::text);

CREATE POLICY "Template pillars follow template permissions" ON template_pillars
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM battleplan_templates 
      WHERE battleplan_templates.id = template_pillars.template_id 
      AND (battleplan_templates.is_public = true OR battleplan_templates.created_by::text = auth.uid()::text)
    )
  );