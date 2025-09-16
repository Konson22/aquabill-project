import axios from 'axios';

const token = sessionStorage.getItem('etixss_token');

// Enable credentials for CSRF and sessions
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://192.168.203.43:8000';
// axios.defaults.baseURL = 'https://etixss.com';
axios.defaults.headers.common.Authorization = `Bearer ${token}`;

// Fetch CSRF token before making API calls
export const setupAxios = async () => {
    await axios.get('/sanctum/csrf-cookie');
};

export default axios;
