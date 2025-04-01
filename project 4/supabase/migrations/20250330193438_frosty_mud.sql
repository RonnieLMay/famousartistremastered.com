/*
  # Add Storage Bucket for Audio Files

  1. New Storage Bucket
    - Create 'audio' bucket for storing audio files
    - Enable public access for preview files
    - Set up RLS policies for secure access

  2. Security
    - Enable RLS on the bucket
    - Add policies for authenticated users to:
      - Upload their own files
      - Read their own files
      - Share preview files publicly
*/

-- Create the audio storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', false);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow users to upload their own files
CREATE POLICY "Users can upload their own audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can read their own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to preview files
CREATE POLICY "Anyone can read preview files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio' AND
  name LIKE '%_preview_%'
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own audio files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = auth.uid()::text
);