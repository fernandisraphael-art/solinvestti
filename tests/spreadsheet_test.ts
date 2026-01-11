
import { parseBatchData } from '../lib/importHelper';

const spreadsheetData = [
    {
        "NOME_D_AUSINA": "GDSun Energia",
        "EMPRESA": "GDSUN",
        "NOME_CONTATO": "Gestor Comercial",
        "TEL": "(34) 3215-0000",
        "CEL": "(34) 9XXXX-XXXX",
        "CIDADE": "Uberlândia",
        "REGIAO": "MG",
        "EMAIL": "parcerias@gdsun.com.br",
        "SITE": "https://www.gdsun.com.br",
        "DEMANDA_DISPONIVEL": "45",
        "FATURAMENTO_ANUAL": "R$ 120.000.000,00"
    },
    {
        "NOME_D_AUSINA": "Solatio GD",
        "EMPRESA": "SOLATIO",
        "NOME_CONTATO": "Coordenador de Parcerias",
        "TEL": "(31) 9XXXX-XXXX",
        // Missing CEL and EMAIL to test fallbacks
        "CIDADE": "Nova Lima",
        "REGIAO": "MG",
        "DEMANDA_DISPONIVEL": "50",
        "FATURAMENTO_ANUAL": "150.000.000,00"
    }
];

try {
    const results = parseBatchData(spreadsheetData);
    console.log(JSON.stringify(results, null, 2));

    const r1 = results[0];
    if (r1.company !== 'GDSUN') throw new Error('Company mismatch');
    if (r1.city !== 'Uberlândia') throw new Error('City mismatch');
    if (r1.annualRevenue !== 120000000) throw new Error(`Revenue mismatch: got ${r1.annualRevenue}`);
    if (r1.responsiblePhone !== '(34) 9XXXX-XXXX') throw new Error('Mobile mismatch');
    if (r1.landline !== '(34) 3215-0000') throw new Error('Landline mismatch');
    if (r1.capacity !== '45') throw new Error('Capacity mismatch');

    console.log('SUCCESS: Spreadsheet Mapping Verified.');
} catch (e) {
    console.error(e);
}
