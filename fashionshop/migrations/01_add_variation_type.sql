-- Add variation_type column to product_variations table
ALTER TABLE product_variations 
ADD COLUMN variation_type text DEFAULT 'Custom';

-- Optional: Add check constraint to ensure valid types
ALTER TABLE product_variations 
ADD CONSTRAINT check_variation_type 
CHECK (variation_type IN ('Color', 'Size', 'Custom'));
