/*
  # Initial Schema Setup for Famous Artist Remastered

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, linked to auth.users)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tracks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `original_file` (text, original audio file path)
      - `processed_file` (text, mastered audio file path)
      - `preview_file` (text, preview audio file path)
      - `preset` (text, mastering preset used)
      - `status` (text, processing status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `track_id` (uuid, foreign key to tracks)
      - `amount` (numeric, purchase amount)
      - `status` (text, payment status)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure file access and purchases
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tracks table
CREATE TABLE tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  original_file text NOT NULL,
  processed_file text,
  preview_file text,
  preset text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('processing', 'completed', 'failed'))
);

-- Create purchases table
CREATE TABLE purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  track_id uuid REFERENCES tracks(id) NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed'))
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for tracks
CREATE POLICY "Users can view own tracks"
  ON tracks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own tracks"
  ON tracks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tracks"
  ON tracks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for purchases
CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();