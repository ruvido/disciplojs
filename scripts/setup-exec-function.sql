-- Setup execution function to ensure proper database state
-- This function should be executed after all migrations to validate schema

CREATE OR REPLACE FUNCTION validate_disciplo_schema()
RETURNS TABLE (
  table_name TEXT,
  validation_status TEXT,
  details TEXT
) AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Check all required tables exist
  FOR rec IN 
    SELECT t.table_name as tname 
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
    AND t.table_name IN (
      'users', 'groups', 'group_members', 'battleplans', 'pillars', 
      'routines', 'routine_logs', 'logbook_entries', 'polls', 
      'poll_options', 'poll_votes', 'battleplan_templates', 'template_pillars'
    )
  LOOP
    RETURN QUERY SELECT rec.tname, 'EXISTS'::TEXT, 'Table found'::TEXT;
  END LOOP;
  
  -- Check for required indexes
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_telegram_id') THEN
    RETURN QUERY SELECT 'indexes'::TEXT, 'PERFORMANCE_OK'::TEXT, 'Performance indexes created'::TEXT;
  ELSE
    RETURN QUERY SELECT 'indexes'::TEXT, 'MISSING'::TEXT, 'Performance indexes not found'::TEXT;
  END IF;
  
  -- Check RLS is enabled
  FOR rec IN 
    SELECT schemaname, tablename
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename IN ('users', 'groups', 'group_members', 'battleplans')
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE n.nspname = 'public' 
      AND c.relname = rec.tablename 
      AND c.relrowsecurity = true
    ) THEN
      RETURN QUERY SELECT rec.tablename, 'RLS_ENABLED'::TEXT, 'Row Level Security is active'::TEXT;
    ELSE
      RETURN QUERY SELECT rec.tablename, 'RLS_MISSING'::TEXT, 'Row Level Security not enabled'::TEXT;
    END IF;
  END LOOP;
  
  -- Check foreign key constraints
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'routine_logs'
    AND ccu.column_name = 'user_id'
  ) THEN
    RETURN QUERY SELECT 'routine_logs'::TEXT, 'FK_OK'::TEXT, 'Foreign key constraints present'::TEXT;
  ELSE
    RETURN QUERY SELECT 'routine_logs'::TEXT, 'FK_MISSING'::TEXT, 'Foreign key constraints missing'::TEXT;
  END IF;
  
  -- Check for default group setup
  IF EXISTS (SELECT 1 FROM groups WHERE is_default = true) THEN
    RETURN QUERY SELECT 'default_group'::TEXT, 'CONFIGURED'::TEXT, 'Default group exists'::TEXT;
  ELSE
    RETURN QUERY SELECT 'default_group'::TEXT, 'NEEDS_SETUP'::TEXT, 'No default group configured'::TEXT;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Helper function to check migration status
CREATE OR REPLACE FUNCTION check_migration_status()
RETURNS TABLE (
  component TEXT,
  status TEXT,
  recommendation TEXT
) AS $$
BEGIN
  -- Check if all core functions exist
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'add_to_main_group') THEN
    RETURN QUERY SELECT 'triggers'::TEXT, 'OK'::TEXT, 'Core triggers are installed'::TEXT;
  ELSE
    RETURN QUERY SELECT 'triggers'::TEXT, 'MISSING'::TEXT, 'Run migration 001_initial_schema.sql'::TEXT;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_default_group_from_telegram') THEN
    RETURN QUERY SELECT 'bot_functions'::TEXT, 'OK'::TEXT, 'Bot functions are installed'::TEXT;
  ELSE
    RETURN QUERY SELECT 'bot_functions'::TEXT, 'MISSING'::TEXT, 'Run migration 006_bot_functions.sql'::TEXT;
  END IF;
  
  -- Check enum types
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    RETURN QUERY SELECT 'enums'::TEXT, 'OK'::TEXT, 'Custom types are defined'::TEXT;
  ELSE
    RETURN QUERY SELECT 'enums'::TEXT, 'MISSING'::TEXT, 'Run migration 001_initial_schema.sql first'::TEXT;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Usage:
-- SELECT * FROM validate_disciplo_schema();
-- SELECT * FROM check_migration_status();