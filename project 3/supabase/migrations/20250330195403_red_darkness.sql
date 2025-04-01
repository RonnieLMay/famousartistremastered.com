/*
  # Update RLS Policies

  1. Changes
    - Add more granular RLS policies for profiles table
    - Add RLS policies for tracks table
    - Add RLS policies for purchases table

  2. Security
    - Ensure users can only access their own data
    - Allow public read access to certain profile fields
*/

-- Profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Anyone can view public profile fields"
ON profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Tracks table policies
DROP POLICY IF EXISTS "Users can insert own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can update own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can view own tracks" ON tracks;

CREATE POLICY "Users can insert own tracks"
ON tracks FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tracks"
ON tracks FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own tracks"
ON tracks FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own tracks"
ON tracks FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Purchases table policies
DROP POLICY IF EXISTS "Users can insert own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;

CREATE POLICY "Users can insert own purchases"
ON purchases FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own purchases"
ON purchases FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own purchases"
ON purchases FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());