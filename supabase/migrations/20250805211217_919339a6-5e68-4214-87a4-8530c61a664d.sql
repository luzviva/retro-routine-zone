-- Fix security warnings by setting search_path for functions

-- Update get_user_families function
CREATE OR REPLACE FUNCTION public.get_user_families()
RETURNS TABLE(family_id UUID) AS $$
BEGIN
  RETURN QUERY 
  SELECT fm.family_id 
  FROM public.family_members fm 
  WHERE fm.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Update is_user_parent_in_family function
CREATE OR REPLACE FUNCTION public.is_user_parent_in_family(check_family_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.family_members fm 
    WHERE fm.user_id = auth.uid() 
    AND fm.family_id = check_family_id 
    AND fm.role = 'parent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';