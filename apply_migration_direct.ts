import pg from 'pg';
const { Client } = pg;

const client = new Client({
    user: 'postgres',
    host: 'db.fsmbeutvsxjlctthvmas.supabase.co',
    database: 'postgres',
    password: 'R@phael1',
    port: 5432,
});

const sql = `
ALTER TABLE generators ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS responsible_phone text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS access_email text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS access_password text;

COMMENT ON COLUMN generators.logo_url IS 'URL of the generator logo image';
`;

async function main() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully.');

        console.log('Applying migration...');
        await client.query(sql);
        console.log('Migration applied successfully!');

    } catch (err: any) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

main();
