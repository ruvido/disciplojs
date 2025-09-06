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
  END IF;
  
  RETURN new_group_id;
END;
$$ LANGUAGE plpgsql;

-- Function to manually set default group from admin dashboard
CREATE OR REPLACE FUNCTION set_default_group_manual(group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove default flag from all groups
  UPDATE groups SET is_default = FALSE WHERE is_default = TRUE;
  
  -- Set new default
  UPDATE groups SET is_default = TRUE WHERE id = group_id;
  
  -- Add all approved users to this group
  INSERT INTO group_members (groups.group_id, user_id, role)
  SELECT group_id, id, 'member'
  FROM users
  WHERE approved = TRUE
  ON CONFLICT DO NOTHING;
  
  RETURN TRUE;
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
  -- Check if group exists
  SELECT id INTO v_group_id FROM groups WHERE telegram_chat_id = p_telegram_chat_id;
  
  IF v_group_id IS NULL THEN
    -- Create new group
    INSERT INTO groups (name, description, type, telegram_chat_id)
    VALUES (p_group_name, 'Synced from Telegram', p_group_type, p_telegram_chat_id)
    RETURNING id INTO v_group_id;
  ELSE
    -- Update group name if changed
    UPDATE groups SET name = p_group_name WHERE id = v_group_id;
  END IF;
  
  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql;