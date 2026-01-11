import { EnergyProvider } from '../types';

export const parseBatchData = (data: any[]): EnergyProvider[] => {
    return data.map((row: any) => {
        const cleanStr = (s: any) => String(s || '').trim();
        // Helper to normalize strings (trim, uppercase, remove accents, remove _)
        const normalizeKey = (k: string) =>
            k.trim().toUpperCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                .replace(/_/g, ' ').replace(/\./g, '');

        // Normalize keys once for easier matching
        const normalizedKeys = Object.keys(row).reduce((acc, key) => {
            acc[normalizeKey(key)] = key; // Map CLEAN -> ORIGINAL
            return acc;
        }, {} as Record<string, string>);

        const findValue = (searchTerms: string[]) => {
            for (const term of searchTerms) {
                const cleanTerm = normalizeKey(term);
                // 1. Try direct match on normalized keys
                if (normalizedKeys[cleanTerm]) {
                    return cleanStr(row[normalizedKeys[cleanTerm]]);
                }
                // 2. Try partial match
                const partialKey = Object.keys(normalizedKeys).find(k => k.includes(cleanTerm));
                if (partialKey) {
                    return cleanStr(row[normalizedKeys[partialKey]]);
                }
            }
            return null;
        };

        // Specific Mappings based on User Request
        // Note: Handling both "NOME_D_AUSINA" (Screenshot typo) and "NOME DA USINA" (Correction)
        const name = findValue(['USINA', 'NOME D AUSINA', 'NOME DA USINA', 'NOME', 'EMPRESA', 'GERADOR', 'NAME']) || 'Nova Usina';
        const company = findValue(['EMPRESA', 'COMPANY']) || name; // Fallback to name if company missing

        // ... rest of the parsing ...
        const region = findValue(['REGIAO', 'REGION', 'ESTADO', 'UF', 'LOCAL']) || 'MG';
        const city = findValue(['CIDADE', 'CITY', 'LOCAL', 'MUNICIPIO']) || 'Brasil';

        const website = findValue(['SITE', 'WEBSITE', 'URL']) || '';

        // Capacity
        const capacityRaw = findValue(['DEMANDA DISPONIVEL', 'DEMANDA', 'CAPACIDADE', 'POTENCIA', 'POWER', 'KWP', 'MWP']) || '0';
        const capacityMatch = capacityRaw.match(/(\d+[.,]?\d*)/);
        const capacity = capacityMatch ? capacityMatch[0].replace(',', '.') : '0';

        // Revenue
        const revenueRaw = findValue(['FATURAMENTO ANUAL', 'FATURAMENTO', 'REVENUE', 'VALOR', 'MONTAGEM']) || '0';
        // Keep only numbers, commas, dots, minus
        const revenueClean = revenueRaw.replace(/[^0-9,.-]/g, '').replace(',', '.');
        const revenue = parseFloat(revenueClean) || 0;

        // Discount
        const discountRaw = findValue(['DESC', 'DESCONTO', 'DISCOUNT']) || '15'; // Removed dot from search terms as we clean keys
        let discount = parseFloat(discountRaw.replace('%', '').replace(',', '.')) || 15;

        // Commission
        // User noted missing commission. If column "COMISSAO" exists, use it. If not, default to 5.
        // Screenshot did not show "COMISSAO", so it likely relies on default.
        const commRaw = findValue(['COMM', 'COMISSAO', 'COMMISSION']) || '5';
        let commission = parseFloat(commRaw.replace('%', '').replace(',', '.')) || 5;


        let respName = findValue(['NOME_CONTATO', 'Nome Contato', 'RESPONSÁVEL', 'Responsável', 'Responsavel', 'Responsible', 'Gestor']) || 'Admin Solinvestti';

        // Explicitly separate Phone and Email logic
        // 1. Look for explicit Phone columns
        // 'CEL' is usually Mobile, 'TEL' is Landline
        let mobile = findValue(['CEL', 'Cel', 'Celular', 'Mobile', 'Whatsapp', 'ZAP']) || '';
        let landline = findValue(['TEL', 'Tel', 'Telefone', 'Landline', 'Fixo']) || '';

        // If one is missing, check generic phone columns
        if (!mobile) mobile = findValue(['PHONE', 'Phone']) || '';

        // 2. Look for explicit Email columns
        let rawEmail = findValue(['EMAIL', 'Email', 'E-mail', 'Mail', 'Correio']) || '';

        // 3. Fallback: Check 'Contato' column
        const genericContact = findValue(['CONTATO', 'Contato', 'Contact']) || '';

        if (genericContact) {
            if (genericContact.includes('@')) {
                if (!rawEmail) rawEmail = genericContact;
            } else if (genericContact.match(/\d{4}/)) {
                if (!mobile) mobile = genericContact;
            } else {
                if (respName === 'Admin Solinvestti') respName = genericContact;
            }
        }

        // CRITICAL: Ensure Phone is NOT an Email
        if (mobile.includes('@')) {
            if (!rawEmail) rawEmail = mobile;
            mobile = '---';
        }

        if (!rawEmail) rawEmail = `usina${Math.floor(Math.random() * 10000)}@solinvestti.com.br`;
        if (!mobile) mobile = '---';

        return {
            name,
            company,
            type: 'Solar',
            region,
            city,
            discount,
            capacity,
            commission,
            responsibleName: respName,
            responsiblePhone: mobile, // Using Mobile as primary contact
            landline,
            website,
            annualRevenue: revenue,
            accessEmail: rawEmail,
            accessPassword: 'admin',
            status: 'active',
            rating: 4.5,
            estimatedSavings: 0,
            color: 'from-emerald-400 to-teal-700',
            icon: 'public'
        };
    });
};
