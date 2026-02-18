import axios from 'axios';

const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    // Fallback for local development
    return `http://${window.location.hostname}:3000/api`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

import { haptics } from '../utils/haptics';

// ... (existing code)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        haptics.error(); // Vibrate on error
        if (error.response?.status === 401) {
            // Only redirect to login if not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
