import pg from 'pg';
const { Client } = pg;

const client = new Client({
    user: 'postgres',
    host: 'db.fsmbeutvsxjlctthvmas.supabase.co',
    database: 'postgres',
    password: 'Rc13303546',
    port: 5432,
});

const sql = `
-- Drop existing insert policy if it exists to avoid conflict
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON generators;
DROP POLICY IF EXISTS "Enable insert for all users" ON generators;
DROP POLICY IF EXISTS "Enable insert for service_role" ON generators;

-- Create a permissive insert policy for authenticated users (like admin)
CREATE POLICY "Enable insert for authenticated users"
ON generators
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE generators ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions just in case
GRANT ALL ON TABLE generators TO authenticated;
GRANT ALL ON TABLE generators TO service_role;
`;

async function main() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully.');

        console.log('Applying RLS migration...');
        await client.query(sql);
        console.log('RLS Migration applied successfully!');

    } catch (err: any) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

main();
