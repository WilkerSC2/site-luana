/*
  # Fix Security Issues

  ## 1. Remove Unused Indexes
  
  - Drop `idx_hero_images_active` - Not being used in current queries
  - Drop `idx_album_photos_album_id` - Redundant with composite index `idx_album_photos_order`

  ## 2. Fix Function Search Path
  
  - Recreate `update_updated_at_column` function with fixed search_path
  - This prevents potential security vulnerabilities from search_path manipulation

  ## 3. Important Notes
  
  - Leaked Password Protection must be enabled in Supabase Dashboard
  - Navigate to: Authentication > Settings > Password Protection
  - Enable "Check for compromised passwords" feature
*/

-- Remove unused indexes
DROP INDEX IF EXISTS idx_hero_images_active;
DROP INDEX IF EXISTS idx_album_photos_album_id;

-- Recreate function with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;