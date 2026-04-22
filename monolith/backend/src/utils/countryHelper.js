/**
 * Utility to determine if a country belongs to the European zone for DSV Simple Booking.
 * Common European country codes (ISO 2rd-digit). 
 * Generally EU/EFTA states + UK.
 */
const EUROPEAN_COUNTRIES = [
    'AL', 'AD', 'AT', 'BE', 'BA', 'BG', 'HR', 'CY', 'CZ', 'DK',
    'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'LV',
    'LI', 'LT', 'LU', 'MT', 'MC', 'ME', 'NL', 'MK', 'NO', 'PL',
    'PT', 'RO', 'SM', 'RS', 'SK', 'SI', 'ES', 'SE', 'CH', 'UA',
    'GB', 'VA'
];

/**
 * Checks if a shipment to the given country code should use the Simple flow.
 * @param {string} countryCode 2-digit ISO country code.
 * @returns {boolean} True if simple, False if complex.
 */
exports.isSimpleFlow = (countryCode) => {
    if (!countryCode) return true; // Default to simple if unknown
    return EUROPEAN_COUNTRIES.includes(countryCode.toUpperCase());
};

/**
 * Checks if a shipment to the given country code requires the Complex flow.
 * @param {string} countryCode 2-digit ISO country code.
 * @returns {boolean}
 */
exports.isComplexFlow = (countryCode) => {
    return !exports.isSimpleFlow(countryCode);
};
