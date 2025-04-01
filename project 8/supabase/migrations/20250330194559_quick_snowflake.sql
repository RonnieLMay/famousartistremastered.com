/*
  # Add profile fields

  1. Changes
    - Add new columns to profiles table:
      - username (text, unique)
      - artist_name (text)
      - bio (text)
      - website (text)
      - avatar_url (text)

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE profiles
ADD COLUMN username text UNIQUE,
ADD COLUMN artist_name text,
ADD COLUMN bio text,
ADD COLUMN website text,
ADD COLUMN avatar_url text;