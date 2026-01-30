import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fsmbeutvsxjlctthvmas.supabase.co';
const SERVICE_ROLE_KEY = 'sb_secret_4OtGtn6UGucowwSrAm4Xtw_gBzFbauw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const sql = `
ALTER TABLE generators ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS responsible_phone text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS access_email text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS access_password text;
`;

async function main() {
    console.log('Verifying if logo_url column exists...');

    // Try to select the column
    const { data, error } = await supabase
        .from('generators')
        .select('logo_url')
        .limit(1);

    if (!error) {
        console.log('SUCCESS: Column logo_url Verified!');
        return;
    }

    console.error('VERIFICATION FAILED: ' + error.message);
}

main().catch(err => console.error('Script error:', err));
