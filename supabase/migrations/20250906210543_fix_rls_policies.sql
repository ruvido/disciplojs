-- Fix infinite recursion in RLS policies
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Admins can do everything" ON users;
DROP POLICY IF EXISTS "Admins can manage groups" ON groups;

-- Create a secure function to check admin status without recursion
-- This function uses SECURITY DEFINER to bypass RLS when checking admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Use auth.uid() directly in a query with security definer to bypass RLS
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Recreate admin policies using the function instead of subqueries
CREATE POLICY "Admins can do everything on users" ON users
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage groups" ON groups
  FOR ALL USING (public.is_admin());

-- Also fix any other policies that might reference users table in subqueries
-- Update group members policy to avoid potential issues
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;
CREATE POLICY "Group admins can manage members" ON group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id 
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
    )
    OR public.is_admin()
  );

-- Update other policies to use the safe function where needed
DROP POLICY IF EXISTS "Group admins can create logbook entries" ON logbook_entries;
CREATE POLICY "Group admins can create logbook entries" ON logbook_entries
  FOR INSERT WITH CHECK (
    (EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = logbook_entries.group_id 
      AND user_id = auth.uid()
      AND role = 'admin'
    ) OR public.is_admin())
    AND author_id = auth.uid()
  );

DROP POLICY IF EXISTS "Group admins can create polls" ON polls;
CREATE POLICY "Group admins can create polls" ON polls
  FOR INSERT WITH CHECK (
    (EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = polls.group_id 
      AND user_id = auth.uid()
      AND role = 'admin'
    ) OR public.is_admin())
    AND created_by = auth.uid()
  );