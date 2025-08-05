-- Update profiles table to include PIN for parents
ALTER TABLE public.profiles 
ADD COLUMN parent_pin TEXT;

-- Create index for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- Update the handle_new_user function to include parent_pin from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, parent_pin)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'parent_pin'
  );
  RETURN NEW;
END;
$$;