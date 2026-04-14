import axios from 'axios'
const backendUrl =
    import.meta.env.MODE === "development"
        ? `http://${window.location.hostname}:5000`
        : import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;