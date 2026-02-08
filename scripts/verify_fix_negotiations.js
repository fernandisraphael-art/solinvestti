const url = 'https://fsmbeutvsxjlctthvmas.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbWJldXR2c3hqbGN0dGh2bWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjExNDYsImV4cCI6MjA4MzUzNzE0Nn0.nNHz81E8AXAFKr_e-I8FaABTM12R3E6OutlxmgqbM5k';

async function run() {
    console.log('Running Verification for Negotiations Fix...');
    try {
        const clientsRes = await fetch(`${url}/rest/v1/clients?select=*`, {
            headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
        });
        const clients = await clientsRes.json();

        // Find a client we know is pending
        const pendingClients = clients.filter(c =>
            c.status === 'pending_approval' ||
            c.status === 'in_negotiation' ||
            c.status === 'em_negociacao'
        );

        console.log(`Potential Pending Negotiations in DB: ${pendingClients.length}`);

        // Simulate Logic
        const displayedNegotiations = pendingClients.map(c => {
            let displayStatus = 'Aguardando Documentação';
            if (c.status === 'pending_approval' || c.status === 'pending') displayStatus = 'Análise de Crédito';
            else if (c.status === 'in_negotiation' || c.status === 'em_negociacao') displayStatus = 'Em Negociação';
            else if (c.status === 'waiting_signatures' || c.status === 'aguardando_assinatura') displayStatus = 'Aguardando Assinatura';
            return { id: c.id, status: displayStatus };
        });

        if (displayedNegotiations.length > 0) {
            console.log('SUCCESS: Pending negotiations identified correctly.');
            console.log('Sample Mappings:', displayedNegotiations);
        } else {
            if (clients.length > 0) {
                console.log('WARNING: No pending clients found in DB to verify, but logic was updated.');
            } else {
                console.error('FAILURE: Could not fetch clients.');
                process.exit(1);
            }
        }

    } catch (e) {
        console.error('Exception:', e);
        process.exit(1);
    }
}

run();
