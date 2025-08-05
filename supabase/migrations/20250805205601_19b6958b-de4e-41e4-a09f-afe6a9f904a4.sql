-- Add additional fields to profiles table for child profiles
ALTER TABLE public.profiles 
ADD COLUMN avatar_url TEXT,
ADD COLUMN birth_date DATE,
ADD COLUMN favorite_color TEXT,
ADD COLUMN current_level INTEGER DEFAULT 1,
ADD COLUMN total_experience INTEGER DEFAULT 0,
ADD COLUMN is_child BOOLEAN DEFAULT false;

-- Create child_settings table for specific child configurations
CREATE TABLE public.child_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bedtime TIME,
  wakeup_time TIME,
  daily_screen_time_limit INTEGER DEFAULT 120, -- minutes
  weekly_allowance INTEGER DEFAULT 0, -- coins
  difficulty_level TEXT DEFAULT 'normal' CHECK (difficulty_level IN ('easy', 'normal', 'hard')),
  rewards_enabled BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  parent_approval_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create achievements table for tracking child accomplishments
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  points_required INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'tasks', 'habits', 'learning', 'social')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements to track which achievements each child has earned
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create avatar_customizations table for child avatar personalization
CREATE TABLE public.avatar_customizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hair_style TEXT DEFAULT 'default',
  hair_color TEXT DEFAULT '#8B4513',
  skin_tone TEXT DEFAULT '#FDBCB4',
  outfit TEXT DEFAULT 'default',
  accessory TEXT,
  background TEXT DEFAULT 'default',
  unlocked_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.child_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_customizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for child_settings
CREATE POLICY "Users can view their own child settings" 
ON public.child_settings 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own child settings" 
ON public.child_settings 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own child settings" 
ON public.child_settings 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Parents can view family children settings" 
ON public.child_settings 
FOR SELECT 
USING (
  user_id IN (
    SELECT fm1.user_id 
    FROM public.family_members fm1 
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id 
    WHERE fm2.user_id = auth.uid() AND fm2.role = 'parent' AND fm1.role = 'child'
  )
);

CREATE POLICY "Parents can update family children settings" 
ON public.child_settings 
FOR UPDATE 
USING (
  user_id IN (
    SELECT fm1.user_id 
    FROM public.family_members fm1 
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id 
    WHERE fm2.user_id = auth.uid() AND fm2.role = 'parent' AND fm1.role = 'child'
  )
);

-- RLS Policies for achievements
CREATE POLICY "Everyone can view achievements" 
ON public.achievements 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Family members can view each other's achievements" 
ON public.user_achievements 
FOR SELECT 
USING (
  user_id IN (
    SELECT fm1.user_id 
    FROM public.family_members fm1 
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id 
    WHERE fm2.user_id = auth.uid()
  )
);

-- RLS Policies for avatar_customizations
CREATE POLICY "Users can view their own avatar customizations" 
ON public.avatar_customizations 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own avatar customizations" 
ON public.avatar_customizations 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own avatar customizations" 
ON public.avatar_customizations 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Family members can view each other's avatars" 
ON public.avatar_customizations 
FOR SELECT 
USING (
  user_id IN (
    SELECT fm1.user_id 
    FROM public.family_members fm1 
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id 
    WHERE fm2.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_child_settings_user_id ON public.child_settings(user_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX idx_avatar_customizations_user_id ON public.avatar_customizations(user_id);

-- Add triggers for timestamp updates
CREATE TRIGGER update_child_settings_updated_at
  BEFORE UPDATE ON public.child_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_avatar_customizations_updated_at
  BEFORE UPDATE ON public.avatar_customizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default achievements
INSERT INTO public.achievements (name, description, points_required, category, icon_url) VALUES
('Primeira Tarefa', 'Completou sua primeira tarefa!', 0, 'tasks', NULL),
('Aventureiro Iniciante', 'Completou 5 tarefas', 50, 'tasks', NULL),
('Explorador', 'Completou 25 tarefas', 250, 'tasks', NULL),
('Mestre das Missões', 'Completou 100 tarefas', 1000, 'tasks', NULL),
('Streak Iniciante', 'Completou tarefas por 3 dias seguidos', 30, 'habits', NULL),
('Disciplinado', 'Completou tarefas por 7 dias seguidos', 70, 'habits', NULL),
('Lenda da Consistência', 'Completou tarefas por 30 dias seguidos', 300, 'habits', NULL),
('Colecionador de Moedas', 'Acumulou 100 moedas', 100, 'general', NULL),
('Rico Aventureiro', 'Acumulou 500 moedas', 500, 'general', NULL),
('Personalização Master', 'Desbloqueou 10 itens de avatar', 150, 'social', NULL);

-- Function to automatically create child profile when user is added to family as child
CREATE OR REPLACE FUNCTION public.setup_child_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Only setup for children
  IF NEW.role = 'child' THEN
    -- Update profile to mark as child
    UPDATE public.profiles 
    SET is_child = true 
    WHERE user_id = NEW.user_id;
    
    -- Create default child settings
    INSERT INTO public.child_settings (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create default avatar customizations
    INSERT INTO public.avatar_customizations (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Initialize coin balance
    INSERT INTO public.user_coins (user_id, family_id, balance)
    VALUES (NEW.user_id, NEW.family_id, 0)
    ON CONFLICT (user_id, family_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic child profile setup
CREATE TRIGGER setup_child_profile_trigger
  AFTER INSERT ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.setup_child_profile();