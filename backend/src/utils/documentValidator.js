exports.getRequiredDocs = (originCountry, destCountry, commodity) => {
    // Mock logic based on country codes
    const required = [];

    // General rule: International shipments need invoice
    if (originCountry !== destCountry) {
        required.push('commercial_invoice');
    }

    // Specific rules (examples)
    if (destCountry === 'CN') { // China
        required.push('packing_list');
        required.push('customs_declaration');
    }

    if (commodity && commodity.toLowerCase().includes('battery')) {
        required.push('dg_declaration');
    }

    return required;
};

exports.validateDocs = (providedDocs, requiredDocs) => {
    const missing = requiredDocs.filter(doc => !providedDocs.includes(doc));
    return {
        valid: missing.length === 0,
        missing
    };
};
