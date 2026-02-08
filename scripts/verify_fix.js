import { createClient } from '@supabase/supabase-js';

// Credentials from .env.local
const supabaseUrl = 'https://fsmbeutvsxjlctthvmas.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbWJldXR2c3hqbGN0dGh2bWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjExNDYsImV4cCI6MjA4MzUzNzE0Nn0.nNHz81E8AXAFKr_e-I8FaABTM12R3E6OutlxmgqbM5k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('🔄 Iniciando verificação...');

    // 1. Buscar uma usina para vincular
    const { data: generators, error: genError } = await supabase
        .from('generators')
        .select('id, name')
        .limit(1);

    if (genError || !generators || generators.length === 0) {
        console.error('❌ Erro ao buscar usinas:', genError);
        return;
    }

    const generator = generators[0];
    console.log(`✅ Usina encontrada: ${generator.name} (ID: ${generator.id})`);

    // 2. Inserir cliente de teste
    const testName = `Cliente Teste ${Date.now().toString().slice(-4)}`;
    const clientData = {
        name: testName,
        email: `teste_verify_${Date.now()}@example.com`,
        phone: '11999999999',
        city: 'São Paulo',
        state: 'SP',
        bill_value: 500,
        consumption: 600,
        provider_id: generator.id,
        status: 'pending_approval' // STATUS CHAVE: Deve aparecer em "Negociações"
    };

    const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

    if (clientError) {
        console.error('❌ Erro ao inserir cliente:', clientError);
        return;
    }

    console.log(`✅ Cliente inserido com sucesso: "${client.name}"`);
    console.log(`--------------------------------------------------`);
    console.log(`📝 INSTRUÇÕES PARA VOCÊ VALIDAR:`);
    console.log(`1. Vá no Dashboard da Usina "${generator.name}".`);
    console.log(`2. Verifique a aba "Negociações". O cliente "${testName}" deve estar lá.`);
    console.log(`   (Antes ele não aparecia ou estava sumido).`);
    console.log(`3. Vá no Dashboard Admin -> Clientes.`);
    console.log(`4. Encontre "${testName}" e clique em EXCLUIR.`);
    console.log(`5. Valide se a exclusão foi INSTANTÂNEA (sem travar a tela).`);
    console.log(`--------------------------------------------------`);
}

verify();
