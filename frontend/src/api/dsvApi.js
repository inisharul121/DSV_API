import axios from 'axios';

const dsvApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
dsvApi.interceptors.request.use(
    (config) => {
        const adminToken = localStorage.getItem('adminToken');
        const customerToken = localStorage.getItem('customerToken');

        if (adminToken) {
            config.headers['Authorization'] = `Bearer ${adminToken}`;
        } else if (customerToken) {
            config.headers['Authorization'] = `Bearer ${customerToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
dsvApi.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Unauthorized - Clear all tokens and redirect to login
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            localStorage.removeItem('customerToken');
            localStorage.removeItem('customerInfo');

            // Avoid infinite redirect loop if already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?error=session_expired';
            }
        }
        return Promise.reject(error);
    }
);

export default dsvApi;
