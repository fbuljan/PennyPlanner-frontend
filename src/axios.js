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
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        console.log('Request config:', config);
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
