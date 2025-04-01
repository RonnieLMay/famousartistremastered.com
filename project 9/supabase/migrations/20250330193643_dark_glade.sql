/*
  # Add profile trigger function

  1. Changes
    - Add trigger function to create profile on user signup
    - Add trigger to execute function after user creation
    - Add policy to allow profile creation

  2. Security
    - Function runs with SECURITY DEFINER to ensure it has necessary permissions
    - Only triggered on new user creation
*/

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add policy to allow profile creation
CREATE POLICY "Enable insert for authenticated users only"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);