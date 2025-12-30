-- Migration script to add new fields to existing properties table
-- Run this if you already have the properties table created

-- Add video_urls column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}';

-- Add cep column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS cep VARCHAR(20);

-- Add constraints for media limits
ALTER TABLE properties 
ADD CONSTRAINT IF NOT EXISTS max_images_check 
CHECK (array_length(image_urls, 1) IS NULL OR array_length(image_urls, 1) <= 20);

ALTER TABLE properties 
ADD CONSTRAINT IF NOT EXISTS max_videos_check 
CHECK (array_length(video_urls, 1) IS NULL OR array_length(video_urls, 1) <= 3);

-- Note: If constraints already exist with different names, you may need to drop them first:
-- ALTER TABLE properties DROP CONSTRAINT IF EXISTS old_constraint_name;
