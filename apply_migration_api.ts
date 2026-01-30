import https from 'https';

const PROJECT_REF = 'fsmbeutvsxjlctthvmas';
const API_KEY = 'sb_secret_4OtGtn6UGucowwSrAm4Xtw_gBzFbauw';

const sql = `
ALTER TABLE generators ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS company text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS responsible_phone text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS access_email text;
ALTER TABLE generators ADD COLUMN IF NOT EXISTS access_password text;
`;

const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_REF}/database/query`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Response:', data);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(JSON.stringify({ query: sql }));
req.end();
