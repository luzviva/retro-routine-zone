-- Create or update function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  new_family_id uuid;
BEGIN
  -- Create a new family for the user
  INSERT INTO public.families (name)
  VALUES (COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'Família') || '''s Family')
  RETURNING id INTO new_family_id;
  
  -- Add user as parent to the family
  INSERT INTO public.family_members (user_id, family_id, role)
  VALUES (NEW.id, new_family_id, 'parent');
  
  -- Create user profile
  INSERT INTO public.profiles (user_id, display_name, parent_pin)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'parent_pin'
  );
  
  RETURN NEW;
END;
$$;

-- Update profiles table policies for better isolation
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view family profiles" ON public.profiles
FOR SELECT USING (
  user_id = auth.uid() OR 
  user_id IN (
    SELECT fm1.user_id 
    FROM family_members fm1 
    JOIN family_members fm2 ON fm1.family_id = fm2.family_id 
    WHERE fm2.user_id = auth.uid()
  )
);

-- Update tasks policies to use family isolation
DROP POLICY IF EXISTS "Users can view tasks in their families" ON public.tasks;
CREATE POLICY "Family members can view family tasks" ON public.tasks
FOR SELECT USING (
  family_id IN (
    SELECT family_id 
    FROM family_members 
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create tasks for children" ON public.tasks;
CREATE POLICY "Parents can create tasks" ON public.tasks
FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  family_id IN (
    SELECT family_id 
    FROM family_members 
    WHERE user_id = auth.uid() AND role = 'parent'
  ) AND
  assigned_to IN (
    SELECT fm.user_id 
    FROM family_members fm 
    JOIN family_members parent_fm ON fm.family_id = parent_fm.family_id 
    WHERE parent_fm.user_id = auth.uid() AND parent_fm.role = 'parent'
  )
);

-- Update user_coins policies for family isolation
DROP POLICY IF EXISTS "Users can view their own coins" ON public.user_coins;
CREATE POLICY "Family members can view family coins" ON public.user_coins
FOR SELECT USING (
  user_id = auth.uid() OR
  family_id IN (
    SELECT family_id 
    FROM family_members 
    WHERE user_id = auth.uid()
  )
);

-- Create function to create child profile with automatic family association
CREATE OR REPLACE FUNCTION public.create_child_profile(
  child_name text,
  child_gender text DEFAULT NULL,
  child_birth_date date DEFAULT NULL,
  child_favorite_color text DEFAULT NULL,
  child_avatar_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  parent_family_id uuid;
  new_user_id uuid;
BEGIN
  -- Get parent's family
  SELECT family_id INTO parent_family_id
  FROM family_members 
  WHERE user_id = auth.uid() AND role = 'parent'
  LIMIT 1;
  
  IF parent_family_id IS NULL THEN
    RAISE EXCEPTION 'User is not a parent in any family';
  END IF;
  
  -- Generate a unique user ID for the child
  new_user_id := gen_random_uuid();
  
  -- Create child profile
  INSERT INTO public.profiles (
    user_id, 
    display_name, 
    birth_date, 
    favorite_color, 
    avatar_url, 
    is_child
  ) VALUES (
    new_user_id,
    child_name,
    child_birth_date,
    child_favorite_color,
    child_avatar_url,
    true
  );
  
  -- Add child to family
  INSERT INTO public.family_members (user_id, family_id, role)
  VALUES (new_user_id, parent_family_id, 'child');
  
  -- Create default child settings
  INSERT INTO public.child_settings (user_id)
  VALUES (new_user_id);
  
  -- Create default avatar customizations
  INSERT INTO public.avatar_customizations (user_id)
  VALUES (new_user_id);
  
  -- Initialize coin balance
  INSERT INTO public.user_coins (user_id, family_id, balance)
  VALUES (new_user_id, parent_family_id, 0);
  
  RETURN new_user_id;
END;
$$;