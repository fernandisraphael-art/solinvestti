
import { parseBatchData } from '../lib/importHelper';

const mockData = [
    {
        // Case 1: Contact column has email
        'Usina': 'Test Plant 1',
        'Contato': 'contact@example.com',
        'Capacidade': '1,5 MWp'
    },
    {
        // Case 2: Contact column has phone
        'Usina': 'Test Plant 2',
        'Contato': '11999998888',
        'Capacidade': '500 KWp'
    },
    {
        // Case 3: Explicit Phone has email (Error case handled?)
        'Usina': 'Test Plant 3',
        'Telefone': 'wrong@email.com',
        'Email': 'correct@email.com',
        'Capacidade': '100'
    },
    {
        // Case 4: Random casing
        'nOME': 'Test Plant 4',
        'teLEfoNE': '(11) 98765-4321',
        'cApAcIdAdE': '750'
    }
];

try {
    const results = parseBatchData(mockData);

    console.log('--- Results ---');
    console.log(JSON.stringify(results, null, 2));
    console.log('--- Validation ---');

    let errors = 0;

    // Validation 1
    const p1 = results.find(r => r.name === 'Test Plant 1');
    if (p1?.accessEmail !== 'contact@example.com') {
        console.error('FAIL: Plant 1 Email should be contact@example.com, got', p1?.accessEmail);
        errors++;
    }
    if (p1?.responsiblePhone !== '---') {
        console.error('FAIL: Plant 1 Phone should be ---, got', p1?.responsiblePhone);
        errors++;
    }

    // Validation 2
    const p2 = results.find(r => r.name === 'Test Plant 2');
    if (p2?.responsiblePhone !== '11999998888') {
        console.error('FAIL: Plant 2 Phone should be 11999998888, got', p2?.responsiblePhone);
        errors++;
    }

    // Validation 3
    const p3 = results.find(r => r.name === 'Test Plant 3');
    if (p3?.responsiblePhone !== '---') {
        console.error('FAIL: Plant 3 Phone should be --- (was email), got', p3?.responsiblePhone);
        errors++;
    }
    if (p3?.accessEmail !== 'wrong@email.com' && p3?.accessEmail !== 'correct@email.com') {
        // The logic says if Phone has email, set email to that if email is empty. 
        // But here email is present ('correct@email.com'). 
        // Let's check logic: if (!rawEmail) rawEmail = rawPhone; 
        console.log('Plant 3 Email:', p3?.accessEmail);
    }

    // Validation 4
    const p4 = results.find(r => r.name === 'Test Plant 4');
    if (p4?.responsiblePhone !== '(11) 98765-4321') {
        console.error('FAIL: Plant 4 Phone with mixed case keys not found');
        errors++;
    }

    if (errors === 0) {
        console.log('SUCCESS: All tests passed.');
    } else {
        console.error(`FAILED: ${errors} errors found.`);
    }

} catch (e) {
    console.error('Runtime Error:', e);
}
