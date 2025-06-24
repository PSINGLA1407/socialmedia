-- Function to handle new user creation or update
CREATE OR REPLACE FUNCTION handle_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, bio)
  VALUES (NEW.id, NULL)
  ON CONFLICT (user_id) 
  DO UPDATE SET updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Make sure we don't have duplicate triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_profile();

-- Function to handle profile updates
CREATE OR REPLACE FUNCTION update_profile(
  user_id_input uuid,
  bio_input text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, bio)
  VALUES (user_id_input, bio_input)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    bio = bio_input,
    updated_at = now();
END;
$$; 