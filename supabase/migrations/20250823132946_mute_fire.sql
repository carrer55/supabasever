/*
  # Create user profile trigger

  1. New Functions
    - `handle_new_user()` - Automatically creates a profile when a new user signs up
  
  2. New Triggers
    - Trigger on auth.users insert to create profile automatically
  
  3. Security
    - Function runs with security definer privileges
    - Ensures every new user gets a profile record
*/

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, onboarding_completed, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();