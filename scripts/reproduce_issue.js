const url = 'https://fsmbeutvsxjlctthvmas.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbWJldXR2c3hqbGN0dGh2bWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjExNDYsImV4cCI6MjA4MzUzNzE0Nn0.nNHz81E8AXAFKr_e-I8FaABTM12R3E6OutlxmgqbM5k';

async function run() {
    console.log('Fetching clients...');
    try {
        const response = await fetch(`${url}/rest/v1/clients?select=*`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Error fetching clients:', response.status);
            return;
        }

        const clients = await response.json();
        console.log(`Total clients in DB: ${clients.length}`);

        // Current Logic in App.tsx (Buggy)
        const currentActiveClients = clients.filter(c =>
            c.status === 'active' || c.status === 'approved'
        );
        console.log(`[CURRENT] Active Clients (visible in dashboard): ${currentActiveClients.length}`);

        // Proposed Fix Logic
        const proposedActiveClients = clients.filter(c =>
            c.status === 'active' || c.status === 'approved' || c.status === 'pending_approval' || c.status === 'pending'
        );
        console.log(`[PROPOSED] Active Clients (after fix): ${proposedActiveClients.length}`);

        // Check for 'pending_approval' specifically
        const pending = clients.filter(c => c.status === 'pending_approval');
        console.log(`Clients with status 'pending_approval': ${pending.length}`);

        if (currentActiveClients.length < proposedActiveClients.length) {
            console.log('ISSUE REPRODUCED: Pending clients are hidden.');
        } else {
            console.log('No pending clients found to reproduce issue (or logic is same).');
            // Create a dummy pending client if needed?
        }

    } catch (e) {
        console.error('Exception:', e);
    }
}

run();
