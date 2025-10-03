import axios from 'axios';

const token = sessionStorage.getItem('etixss_token');

// Get API base URL from environment variables
const getApiBaseUrl = () => {
    // For development
    if (__DEV__) {
        return 'http://10.103.26.43'; // Your working dev IP without port
    }
    
    // For production builds (EAS)
    return process.env.EXPO_PUBLIC_API_URL || 'https://your-production-domain.com';
};

// Enable credentials for CSRF and sessions
axios.defaults.withCredentials = true;
axios.defaults.baseURL = getApiBaseUrl();
axios.defaults.headers.common.Authorization = `Bearer ${token}`;

// Add timeout for mobile networks
axios.defaults.timeout = 30000; // 30 seconds

// Add request interceptor for better error handling
axios.interceptors.request.use(
    (config) => {
        // Update token if it changed
        const currentToken = sessionStorage.getItem('etixss_token');
        if (currentToken) {
            config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
            console.error('Network error - check your internet connection and API URL');
        }
        return Promise.reject(error);
    }
);

// Fetch CSRF token before making API calls
export const setupAxios = async () => {
    try {
        await axios.get('/sanctum/csrf-cookie');
    } catch (error) {
        console.warn('CSRF cookie setup failed:', error.message);
    }
};

export default axios;
