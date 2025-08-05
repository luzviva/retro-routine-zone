-- Fix infinite recursion in family_members RLS policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Parents can manage family members" ON public.family_members;
DROP POLICY IF EXISTS "Users can view family members of their families" ON public.family_members;

-- Create a security definer function to get user's families without recursion
CREATE OR REPLACE FUNCTION public.get_user_families()
RETURNS TABLE(family_id UUID) AS $$
BEGIN
  RETURN QUERY 
  SELECT fm.family_id 
  FROM public.family_members fm 
  WHERE fm.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a security definer function to check if user is parent in any family
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate policies using the security definer functions
CREATE POLICY "Users can view family members of their families" 
ON public.family_members 
FOR SELECT 
USING (family_id IN (SELECT * FROM public.get_user_families()));

CREATE POLICY "Parents can manage family members" 
ON public.family_members 
FOR ALL 
USING (public.is_user_parent_in_family(family_id))
WITH CHECK (public.is_user_parent_in_family(family_id));