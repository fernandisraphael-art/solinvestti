import { EnergyProvider } from '../types';

export const parseBatchData = (data: any[]): EnergyProvider[] => {
    return data.map((row: any) => {
        const cleanStr = (s: any) => String(s || '').trim();
        // Helper to normalize strings (trim, uppercase, remove accents, remove symbols)
        const normalizeString = (k: string) =>
            k.trim().toUpperCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                .replace(/[^A-Z0-9 ]/g, ' ') // Replace symbols with space
                .replace(/\s+/g, ' ') // Collapse spaces
                .trim();

        const normalizedKeys = Object.keys(row).reduce((acc, key) => {
            acc[normalizeString(key)] = key;
            return acc;
        }, {} as Record<string, string>);

        const findValue = (searchTerms: string[]) => {
            const cleanSearchTerms = searchTerms.map(normalizeString).filter(t => t.length > 0);

            // 1. Prioritize EXACT matches for any search term
            for (const cleanTerm of cleanSearchTerms) {
                if (normalizedKeys[cleanTerm]) {
                    return cleanStr(row[normalizedKeys[cleanTerm]]);
                }
            }

            // 2. Try partial match as a fallback (minimum 4 chars to avoid false positives)
            for (const cleanTerm of cleanSearchTerms) {
                if (cleanTerm.length < 4) continue;
                const partialKey = Object.keys(normalizedKeys).find(k =>
                    (k.length >= 4 && k.includes(cleanTerm)) || (cleanTerm.length >= 4 && cleanTerm.includes(k))
                );
                if (partialKey) {
                    return cleanStr(row[normalizedKeys[partialKey]]);
                }
            }
            return null;
        };

        const name = findValue(['USINA', 'NOME DA USINA', 'PLANT', 'NAME', 'PROJETO', 'PROJECT', 'NOME D AUSINA']) || 'Nova Usina';
        const company = findValue(['EMPRESA', 'COMPANY', 'FIRMA', 'RAZAO SOCIAL']) || name;

        const region = findValue(['REGIAO', 'ESTADO', 'UF', 'STATE', 'REGION', 'LOCAL']) || 'MG';
        const city = findValue(['CIDADE', 'CITY', 'LOCALIDADE', 'MUNICIPIO', 'TOWN']) || 'Brasil';

        const website = findValue(['SITE', 'WEBSITE', 'URL', 'LINK']) || '';

        // Capacity
        const capacityRaw = findValue(['DEMANDA DISPONIVEL', 'DEMANDA', 'CAPACIDADE', 'CAPACITY', 'POTENCIA', 'POWER', 'KWP', 'MWP', 'GERACAO']) || '0';
        const capacityMatch = capacityRaw.replace(',', '.').match(/(\d+[.]?\d*)/);
        const capacity = capacityMatch ? capacityMatch[0] : '0';

        // Revenue
        const revenueRaw = findValue(['FATURAMENTO ANUAL', 'FATURAMENTO', 'REVENUE', 'EARNINGS', 'VALOR', 'MONTAGEM', 'INCOME']) || '0';
        const revenueClean = revenueRaw.replace(/[R$\s.,]/g, (match, offset, str) => {
            if (match === '.' || match === ',') {
                // If it's the last separator before cents, it's a dot
                const lastSep = Math.max(str.lastIndexOf('.'), str.lastIndexOf(','));
                return offset === lastSep ? '.' : '';
            }
            return '';
        }) || '0';
        const revenue = parseFloat(revenueClean) || 0;

        // Discount
        const discountRaw = findValue(['DESC', 'DESCONTO', 'DISCOUNT', 'OFF']) || '15';
        let discount = parseFloat(discountRaw.replace('%', '').replace(',', '.')) || 15;

        // Commission
        const commRaw = findValue(['COMM', 'COMISSAO', 'COMMISSION', 'FEE']) || '5';
        let commission = parseFloat(commRaw.replace('%', '').replace(',', '.')) || 5;

        // Contacts
        let respName = findValue(['NOME CONTATO', 'RESPONSAVEL', 'RESPONSIBLE', 'GESTOR', 'MANAGER', 'OWNER']) || 'Admin Solinvestti';
        let mobile = findValue(['CEL', 'CELULAR', 'MOBILE', 'WHATSAPP', 'ZAP', 'PHONE']) || '';
        let landline = findValue(['TEL', 'TELEFONE', 'LANDLINE', 'FIXO', 'PHONE']) || '';
        let rawEmail = findValue(['EMAIL', 'E MAIL', 'MAIL', 'CONTATO EMAIL']) || '';

        const genericContact = findValue(['CONTATO', 'CONTACT']) || '';
        if (genericContact) {
            if (genericContact.includes('@')) {
                if (!rawEmail) rawEmail = genericContact;
            } else if (genericContact.match(/\d/)) {
                if (!mobile) mobile = genericContact;
            } else {
                if (respName === 'Admin Solinvestti') respName = genericContact;
            }
        }

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
            responsiblePhone: mobile,
            landline,
            website,
            annualRevenue: revenue,
            accessEmail: rawEmail,
            accessPassword: 'admin',
            status: 'pending',
            rating: 4.5,
            estimatedSavings: 0,
            color: 'from-emerald-400 to-teal-700',
            icon: 'public'
        };
    });
};
