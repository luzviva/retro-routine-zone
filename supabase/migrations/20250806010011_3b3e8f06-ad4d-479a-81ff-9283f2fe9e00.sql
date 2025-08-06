-- Function to ensure user has a family (for existing users)
CREATE OR REPLACE FUNCTION public.ensure_user_has_family()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_family_id uuid;
  new_family_id uuid;
  current_user_id uuid;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if user already has a family
  SELECT family_id INTO user_family_id
  FROM family_members 
  WHERE user_id = current_user_id
  LIMIT 1;
  
  -- If user doesn't have a family, create one
  IF user_family_id IS NULL THEN
    -- Get user's display name for family name
    DECLARE
      user_name text;
    BEGIN
      SELECT display_name INTO user_name
      FROM profiles
      WHERE user_id = current_user_id;
      
      -- Create a new family
      INSERT INTO public.families (name)
      VALUES (COALESCE(user_name, 'Minha') || ' Família')
      RETURNING id INTO new_family_id;
      
      -- Add user as parent to the family
      INSERT INTO public.family_members (user_id, family_id, role)
      VALUES (current_user_id, new_family_id, 'parent');
      
      RETURN new_family_id;
    END;
  END IF;
  
  RETURN user_family_id;
END;
$$;

-- Call this function for the current user to ensure they have a family
SELECT ensure_user_has_family();