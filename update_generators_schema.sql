-- Add missing columns to generators table
ALTER TABLE generators ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS responsible_phone text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS access_email text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS access_password text;

-- Comment on columns for clarity
COMMENT ON COLUMN generators.logo_url IS 'URL of the generator logo image';
COMMENT ON COLUMN generators.company IS 'Legal name (Razão Social) of the generator';
COMMENT ON COLUMN generators.website IS 'Website URL of the generator';
COMMENT ON COLUMN generators.responsible_phone IS 'Contact phone number for the technical responsible';
COMMENT ON COLUMN generators.access_email IS 'Email used for generator dashboard login';
COMMENT ON COLUMN generators.access_password IS 'Password used for generator dashboard login';
