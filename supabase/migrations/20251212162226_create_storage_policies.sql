/*
  # Storage Policies for Portfolio Images

  1. Storage Setup
    - Creates policies for the 'portfolio-images' bucket
    - Allows authenticated users to upload files
    - Allows everyone to view files (public read access)
    - Allows authenticated users to update/delete their uploads
  
  2. Security
    - Upload limited to authenticated users only
    - Public read access for displaying images on the website
    - Update/delete restricted to authenticated users
*/

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-images');

-- Allow everyone to view files (public read)
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-images')
WITH CHECK (bucket_id = 'portfolio-images');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-images');
