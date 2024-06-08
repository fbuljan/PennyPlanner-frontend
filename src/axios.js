import axios from 'axios';

const baseURL = process.env.VUE_APP_BASE_API_URL || 'https://localhost:7086/';

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    config => {
        console.log('Request config:', config);  // Add logging to debug request configuration
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        console.error('Response error:', error);
        return Promise.reject(error);
    }
);

export default axiosInstance;
