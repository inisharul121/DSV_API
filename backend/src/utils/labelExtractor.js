/**
 * Extracts the base64 PDF label content from various possible DSV API response structures.
 * 
 * @param {Object} data - The response data object from the DSV API.
 * @returns {String|null} - The base64 label string or null if not found.
 */
exports.extractLabelContent = (data) => {
    if (!data) return null;

    const resolveBase64 = (content) => {
        if (!content) return null;
        if (typeof content === 'string') return content;

        // Handle case where content is an array (e.g., shippingLabel: [{ format: 'PDF', labelData: '...' }])
        if (Array.isArray(content) && content.length > 0) {
            return content[0].labelData || content[0].shippingLabel || content[0].labelContent || (typeof content[0] === 'string' ? content[0] : null);
        }

        // Handle case where content is an object
        if (typeof content === 'object') {
            return content.labelData || content.shippingLabel || content.labelContent || null;
        }

        return null;
    };

    // Check nested structures first (v1/v2 differences)
    const labelResults = data.labelResults || [];
    const packageLabels = data.packageLabels || [];

    const labelItem = packageLabels.length > 0 ? packageLabels[0] : (labelResults.length > 0 ? labelResults[0] : null);

    if (labelItem) {
        // Prefer shippingLabel, fallback to labelContent
        const content = resolveBase64(labelItem.shippingLabel) || resolveBase64(labelItem.labelContent);
        if (content) return content;
    }

    // Check flat structure (some endpoints return without the array wrapper)
    return resolveBase64(data.shippingLabel) || resolveBase64(data.labelContent) || null;
};
