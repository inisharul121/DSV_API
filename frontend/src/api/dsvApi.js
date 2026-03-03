import axios from 'axios';

const dsvApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
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

export default dsvApi;
