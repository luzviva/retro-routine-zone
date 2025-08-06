-- Update RLS policy for task creation to work with simplified approach
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Parents can create tasks" ON public.tasks;

-- Create a new policy that allows authenticated users to create tasks
-- where they are the creator and the assigned child exists in profiles
CREATE POLICY "Users can create tasks for children" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND assigned_to IN (
    SELECT user_id 
    FROM public.profiles 
    WHERE is_child = true
  )
);