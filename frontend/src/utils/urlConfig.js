/**
 * Centralized URL configuration for the application.
 * This helper provides the base API URL for resource links (labels, invoices).
 */

const getApiBaseUrl = () => {
    // If a VITE_API_URL is explicitly provided in .env, use it.
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // In local development, default to the local backend port.
    if (import.meta.env.DEV) {
        return 'http://localhost:3001/api';
    }

    // In production, use a relative path to the API.
    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
