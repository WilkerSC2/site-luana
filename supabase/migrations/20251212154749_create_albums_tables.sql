/*
  # Create Albums and Album Photos Tables

  1. New Tables
    - `albums`
      - `id` (uuid, primary key) - Unique identifier for each album
      - `title` (text) - Album title/name
      - `cover_image_url` (text) - URL of the cover image for the album
      - `order_index` (integer) - Order to display albums
      - `created_at` (timestamptz) - When the album was created
      
    - `album_photos`
      - `id` (uuid, primary key) - Unique identifier for each photo
      - `album_id` (uuid, foreign key) - Reference to the album
      - `photo_url` (text) - URL of the photo
      - `order_index` (integer) - Order of photos within the album
      - `created_at` (timestamptz) - When the photo was added

  2. Security
    - Enable RLS on both tables
    - Allow public read access to albums and photos (for viewing collections)
    - Only authenticated users can create, update, or delete albums and photos
*/

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cover_image_url text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create album_photos table
CREATE TABLE IF NOT EXISTS album_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_photos ENABLE ROW LEVEL SECURITY;

-- Albums policies
CREATE POLICY "Anyone can view albums"
  ON albums FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert albums"
  ON albums FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update albums"
  ON albums FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete albums"
  ON albums FOR DELETE
  TO authenticated
  USING (true);

-- Album photos policies
CREATE POLICY "Anyone can view album photos"
  ON album_photos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert album photos"
  ON album_photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update album photos"
  ON album_photos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete album photos"
  ON album_photos FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_albums_order ON albums(order_index);
CREATE INDEX IF NOT EXISTS idx_album_photos_album_id ON album_photos(album_id);
CREATE INDEX IF NOT EXISTS idx_album_photos_order ON album_photos(album_id, order_index);