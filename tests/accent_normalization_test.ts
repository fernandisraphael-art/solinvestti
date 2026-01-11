
import { parseBatchData } from '../lib/importHelper';

const testData = [
    {
        // Scenario 1: Screenshot exact match (typo preserved)
        "NOME_D_AUSINA": "Plant A",
        "CIDADE": "City A",
        "DEMANDA_DISPONIVEL": "100",
        "FATURAMENTO_ANUAL": "1000",
        "TEL": "123",
        "COMISSÃO": "10%" // Testing accent
    },
    {
        // Scenario 2: Cleaned up keys
        "Nome da Usina": "Plant B",
        "Cidade": "City B",
        "Demanda Disponivel": "200",
        "Faturamento": "2000"
        // No commission -> default 5
    }
];

try {
    const results = parseBatchData(testData);

    // Check results
    const r1 = results.find(r => r.name === 'Plant A');
    if (!r1 || r1.city !== 'City A' || r1.capacity !== '100') {
        console.error('FAIL Scenario 1: Keys not found', r1);
    } else {
        console.log('PASS Scenario 1 (Screenshot Keys)');
        if (r1.commission === 10) console.log('PASS: Accented Commission Found');
        else console.error(`FAIL: Commission was ${r1.commission}, expected 10`);
    }

    const r2 = results.find(r => r.name === 'Plant B');
    if (!r2 || r2.city !== 'City B') {
        console.error('FAIL Scenario 2: Clean Keys not found', r2);
    } else {
        console.log('PASS Scenario 2 (Clean Keys)');
        if (r2.commission === 5) console.log('PASS: Default Commission');
    }

} catch (e) {
    console.error(e);
}
