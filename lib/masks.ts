
export const maskCurrency = (value: string) => {
    // Remove all non-digits
    let cleanValue = value.replace(/\D/g, "");

    // Convert to number and format
    const options = { minimumFractionDigits: 2 };
    const result = new Intl.NumberFormat('pt-BR', options).format(
        parseFloat(cleanValue) / 100
    );

    return cleanValue ? result : "";
};

export const maskPhone = (value: string) => {
    let cleanValue = value.replace(/\D/g, "");

    if (cleanValue.length <= 10) {
        return cleanValue
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
        return cleanValue
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .substring(0, 15);
    }
};

export const maskCNPJ = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .substring(0, 18);
};

export const maskCEP = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .substring(0, 9);
};

export const parseCurrencyToNumber = (value: string) => {
    return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
};

export const normalizeText = (value: string) => {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
};
