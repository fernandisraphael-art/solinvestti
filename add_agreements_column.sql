-- Add missing agreements column
ALTER TABLE generators ADD COLUMN IF NOT EXISTS agreements text;

COMMENT ON COLUMN generators.agreements IS 'Legal text template for agreements';
