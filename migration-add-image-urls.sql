-- Migration: Add image_urls support to properties table
-- Description: Enables multiple image URLs on properties and avoids schema cache errors

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'properties'
      AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE properties
    ADD COLUMN image_urls TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'max_images_check'
  ) THEN
    ALTER TABLE properties
    ADD CONSTRAINT max_images_check
    CHECK (array_length(image_urls, 1) IS NULL OR array_length(image_urls, 1) <= 20);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_properties_image_urls ON properties USING GIN (image_urls);

COMMENT ON COLUMN properties.image_urls IS 'Array of image URLs attached to the property. Maximum 20 images allowed.';
