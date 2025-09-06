-- Function to set default group when bot becomes admin
CREATE OR REPLACE FUNCTION set_default_group_from_telegram(
  telegram_chat_id TEXT,
  group_name TEXT
)
RETURNS UUID AS $$
DECLARE
  new_group_id UUID;
  has_default BOOLEAN;
BEGIN
  -- Validate input parameters
  IF telegram_chat_id IS NULL OR length(telegram_chat_id) = 0 THEN
    RAISE EXCEPTION 'telegram_chat_id cannot be null or empty';
  END IF;
  
  IF group_name IS NULL OR length(group_name) = 0 THEN
    RAISE EXCEPTION 'group_name cannot be null or empty';
  END IF;
  
  -- Use advisory lock to prevent concurrent execution
  PERFORM pg_advisory_lock(hashtext('set_default_group'));
  
  BEGIN
    -- Check if there's already a default group
    SELECT EXISTS(SELECT 1 FROM groups WHERE is_default = TRUE) INTO has_default;
    
    -- If no default group exists, create/update this one as default
    IF NOT has_default THEN
      -- Check if group already exists with this telegram_chat_id
      SELECT id INTO new_group_id FROM groups WHERE groups.telegram_chat_id = set_default_group_from_telegram.telegram_chat_id;
      
      IF new_group_id IS NULL THEN
        -- Create new group
        INSERT INTO groups (name, description, type, telegram_chat_id, is_default, max_members)
        VALUES (
          group_name,
          'Main community group (auto-created by bot)',
          'main',
          telegram_chat_id,
          TRUE,
          1000
        )
        RETURNING id INTO new_group_id;
      ELSE
        -- Update existing group to be default
        UPDATE groups 
        SET is_default = TRUE, type = 'main' 
        WHERE id = new_group_id;
      END IF;
      
      -- Add all approved users to this default group
      INSERT INTO group_members (group_id, user_id, role)
      SELECT new_group_id, id, 'member'
      FROM users
      WHERE approved = TRUE
      ON CONFLICT DO NOTHING;
    ELSE
      -- Return existing default group ID
      SELECT id INTO new_group_id FROM groups WHERE is_default = TRUE LIMIT 1;
    END IF;
    
    -- Release the advisory lock
    PERFORM pg_advisory_unlock(hashtext('set_default_group'));
    
    RETURN new_group_id;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Ensure we release the lock even if an error occurs
      PERFORM pg_advisory_unlock(hashtext('set_default_group'));
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to manually set default group from admin dashboard
CREATE OR REPLACE FUNCTION set_default_group_manual(p_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validate input
  IF p_group_id IS NULL THEN
    RAISE EXCEPTION 'group_id cannot be null';
  END IF;
  
  -- Check if group exists
  IF NOT EXISTS (SELECT 1 FROM groups WHERE id = p_group_id) THEN
    RAISE EXCEPTION 'Group with id % does not exist', p_group_id;
  END IF;
  
  -- Use advisory lock to prevent concurrent execution
  PERFORM pg_advisory_lock(hashtext('set_default_group_manual'));
  
  BEGIN
    -- Remove default flag from all groups
    UPDATE groups SET is_default = FALSE WHERE is_default = TRUE;
    
    -- Set new default
    UPDATE groups SET is_default = TRUE WHERE id = p_group_id;
    
    -- Add all approved users to this group
    INSERT INTO group_members (group_id, user_id, role)
    SELECT p_group_id, id, 'member'
    FROM users
    WHERE approved = TRUE
    ON CONFLICT DO NOTHING;
    
    -- Release the advisory lock
    PERFORM pg_advisory_unlock(hashtext('set_default_group_manual'));
    
    RETURN TRUE;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Ensure we release the lock even if an error occurs
      PERFORM pg_advisory_unlock(hashtext('set_default_group_manual'));
      RAISE;
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to handle Telegram group sync
CREATE OR REPLACE FUNCTION sync_telegram_group(
  p_telegram_chat_id TEXT,
  p_group_name TEXT,
  p_group_type TEXT DEFAULT 'local'
)
RETURNS UUID AS $$
DECLARE
  v_group_id UUID;
BEGIN
  -- Validate input parameters
  IF p_telegram_chat_id IS NULL OR length(p_telegram_chat_id) = 0 THEN
    RAISE EXCEPTION 'telegram_chat_id cannot be null or empty';
  END IF;
  
  IF p_group_name IS NULL OR length(p_group_name) = 0 THEN
    RAISE EXCEPTION 'group_name cannot be null or empty';
  END IF;
  
  IF p_group_type NOT IN ('main', 'local', 'online', 'special') THEN
    RAISE EXCEPTION 'Invalid group_type: %. Must be one of: main, local, online, special', p_group_type;
  END IF;
  
  -- Check if group exists
  SELECT id INTO v_group_id FROM groups WHERE telegram_chat_id = p_telegram_chat_id;
  
  IF v_group_id IS NULL THEN
    -- Create new group
    INSERT INTO groups (name, description, type, telegram_chat_id)
    VALUES (p_group_name, 'Synced from Telegram', p_group_type, p_telegram_chat_id)
    RETURNING id INTO v_group_id;
  ELSE
    -- Update group name and type if changed
    UPDATE groups 
    SET name = p_group_name, 
        type = p_group_type,
        description = COALESCE(description, 'Synced from Telegram')
    WHERE id = v_group_id;
  END IF;
  
  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql;