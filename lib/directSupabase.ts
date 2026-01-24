
export async function directInsert<T>(table: string, data: any): Promise<T | null> {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('[directInsert] Missing environment variables');
        throw new Error('Configuração do servidor ausente.');
    }

    // Remove campos nulos/undefined se necessário, mas o JSON.stringify já cuida disso

    // O endpoint REST do PostgREST aceita POST para insert
    const response = await fetch(`${url}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation' // Para retornar o objeto criado
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error(`[directInsert] HTTP ${response.status}:`, errText);
        throw new Error(`Erro ao salvar dados: ${response.statusText}`);
    }

    const result = await response.json();
    return result && result.length > 0 ? result[0] : null;
}
