-- Create families table for grouping users
CREATE TABLE public.families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create family_members table to link users to families
CREATE TABLE public.family_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reward_coins INTEGER NOT NULL DEFAULT 0,
  task_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_coins table to track coin balances
CREATE TABLE public.user_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, family_id)
);

-- Enable RLS on all tables
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for families
CREATE POLICY "Users can view families they belong to" 
ON public.families 
FOR SELECT 
USING (
  id IN (
    SELECT family_id 
    FROM public.family_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Parents can update their family" 
ON public.families 
FOR UPDATE 
USING (
  id IN (
    SELECT family_id 
    FROM public.family_members 
    WHERE user_id = auth.uid() AND role = 'parent'
  )
);

-- RLS Policies for family_members
CREATE POLICY "Users can view family members of their families" 
ON public.family_members 
FOR SELECT 
USING (
  family_id IN (
    SELECT family_id 
    FROM public.family_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Parents can manage family members" 
ON public.family_members 
FOR ALL 
USING (
  family_id IN (
    SELECT family_id 
    FROM public.family_members 
    WHERE user_id = auth.uid() AND role = 'parent'
  )
);

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks in their families" 
ON public.tasks 
FOR SELECT 
USING (
  family_id IN (
    SELECT family_id 
    FROM public.family_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Parents can create tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  family_id IN (
    SELECT family_id 
    FROM public.family_members 
    WHERE user_id = auth.uid() AND role = 'parent'
  )
  AND created_by = auth.uid()
);

CREATE POLICY "Parents can update tasks" 
ON public.tasks 
FOR UPDATE 
USING (
  family_id IN (
    SELECT family_id 
    FROM public.family_members 
    WHERE user_id = auth.uid() AND role = 'parent'
  )
);

CREATE POLICY "Children can update their own tasks completion" 
ON public.tasks 
FOR UPDATE 
USING (
  assigned_to = auth.uid()
  AND family_id IN (
    SELECT family_id 
    FROM public.family_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Parents can delete tasks" 
ON public.tasks 
FOR DELETE 
USING (
  family_id IN (
    SELECT family_id 
    FROM public.family_members 
    WHERE user_id = auth.uid() AND role = 'parent'
  )
);

-- RLS Policies for user_coins
CREATE POLICY "Users can view their own coins" 
ON public.user_coins 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own coins" 
ON public.user_coins 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can insert coins" 
ON public.user_coins 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_family_id ON public.tasks(family_id);
CREATE INDEX idx_tasks_task_date ON public.tasks(task_date);
CREATE INDEX idx_user_coins_user_id ON public.user_coins(user_id);

-- Add triggers for timestamp updates
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON public.families
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_coins_updated_at
  BEFORE UPDATE ON public.user_coins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();