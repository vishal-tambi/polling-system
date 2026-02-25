import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Axios instance with base URL pre-configured
const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
});

export default api;
