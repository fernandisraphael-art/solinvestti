-- Add missing status column
ALTER TABLE generators ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Update existing records to active if needed (optional, safer to let user activate in UI)
-- UPDATE generators SET status = 'active' WHERE status IS NULL;

COMMENT ON COLUMN generators.status IS 'Status of the generator: pending, active, cancelled, paused';
