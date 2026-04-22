/**
 * Centralized URL configuration for the application.
 * This helper provides the base API URL for resource links (labels, invoices).
 */

const getApiBaseUrl = () => {
    let baseUrl = '';

    // Check if on localhost/127.0.0.1 for local dev
    if (typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        baseUrl = 'http://localhost:3001';
    } else {
        // In production, use the VITE_API_URL env variable or fallback to current origin for monolith
        baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    }

    // Standardize: Remove trailing slash, then add /api if missing
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
    if (!baseUrl.endsWith('/api')) {
        baseUrl = `${baseUrl}/api`;
    }

    return baseUrl;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Helper to safely combine API_BASE_URL with a stored relative path.
 * Prevents double /api/api issues by ensuring exactly one /api prefix.
 */
export const resolveUrl = (path) => {
    if (!path) return '';
    
    // 1. Remove ANY combination of starting /api/ or api/
    let cleanPath = path;
    while (cleanPath.startsWith('/api') || cleanPath.startsWith('api')) {
        if (cleanPath.startsWith('/api')) {
            cleanPath = cleanPath.substring(4);
        } else if (cleanPath.startsWith('api')) {
            cleanPath = cleanPath.substring(3);
        }
    }
    
    // 2. Ensure cleanPath starts with a single slash
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }
    
    // 3. Get base URL and ensure it doesn't have a trailing slash
    let base = API_BASE_URL;
    if (base.endsWith('/')) {
        base = base.slice(0, -1);
    }
    
    // 4. Guaranteed single /api/ path
    return `${base}${cleanPath}`;
};

export default API_BASE_URL;
