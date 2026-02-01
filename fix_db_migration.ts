
import pg from 'pg';
const { Client } = pg;

// Using credentials found in workspace
const client = new Client({
    user: 'postgres',
    host: 'db.fsmbeutvsxjlctthvmas.supabase.co',
    database: 'postgres',
    password: 'R@phael1',
    port: 5432,
});

const sql = `
-- Create Admin Secrets Table
create table if not exists admin_secrets (
  secret_key text primary key,
  secret_value text
);

alter table admin_secrets enable row level security;

-- Allow Anon to READ (needed for login page to check custom credentials)
drop policy if exists "Allow public read" on admin_secrets;
create policy "Allow public read" on admin_secrets
  for select using (true);

-- Allow Authenticated to WRITE (needed for Settings Tab to save credentials)
drop policy if exists "Allow admin write" on admin_secrets;
create policy "Allow admin write" on admin_secrets
  for all using (auth.role() = 'authenticated');

-- Also clean up the 'admin' user if needed? No, let's just make sure the table works.
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
