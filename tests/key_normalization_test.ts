
import { parseBatchData } from '../lib/importHelper';

const testData = [
    {
        // Scenario 1: Screenshot exact match (typo preserved)
        "NOME_D_AUSINA": "Plant A",
        "CIDADE": "City A",
        "DEMANDA_DISPONIVEL": "100",
        "FATURAMENTO_ANUAL": "1000",
        "TEL": "123"
    },
    {
        // Scenario 2: Cleaned up keys
        "Nome da Usina": "Plant B",
        "Cidade": "City B",
        "Demanda Disponivel": "200",
        "Faturamento": "2000"
    },
    {
        // Scenario 3: English or mixed
        "USINA": "Plant C",
        "CITY": "City C",
        "CAPACIDADE": "300",
        "REVENUE": "3000"
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
    }

    const r2 = results.find(r => r.name === 'Plant B');
    if (!r2 || r2.city !== 'City B' || r2.capacity !== '200') {
        console.error('FAIL Scenario 2: Clean Keys not found', r2);
    } else {
        console.log('PASS Scenario 2 (Clean Keys)');
    }

    const r3 = results.find(r => r.name === 'Plant C');
    if (!r3 || r3.city !== 'City C' || r3.capacity !== '300') {
        console.error('FAIL Scenario 3: Mixed Keys not found', r3);
    } else {
        console.log('PASS Scenario 3 (Mixed Keys)');
    }

    // Commission Check
    if (results.every(r => r.commission === 5)) {
        console.log('PASS: Commission defaults to 5');
    } else {
        console.error('FAIL: Commission default broken');
    }

} catch (e) {
    console.error(e);
}
