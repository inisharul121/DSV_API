/**
 * Centralized URL configuration for the application.
 * This helper provides the base API URL for resource links (labels, invoices).
 */

const getApiBaseUrl = () => {
    // Check if on localhost/127.0.0.1 for local dev
    if (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:3001/api';
    }

    // Default to relative path for any other hostname (production)
    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
