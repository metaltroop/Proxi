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

import toast from 'react-hot-toast';

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        haptics.error(); // Vibrate on error

        // Show toast notification for errors (skip 401s if they are just auth checks)
        const isAuthCheck = error.config?.url?.includes('/auth/me');
        if (!isAuthCheck) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'An unexpected error occurred';
            toast.error(errorMessage);
        }

        if (error.response?.status === 401) {
            // Only redirect to login if not already on login page AND not checking auth status
            if (!window.location.pathname.includes('/login') && !isAuthCheck) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
