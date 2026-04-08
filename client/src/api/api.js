import axios from 'axios'
const backendUrl =
    import.meta.env.MODE === "development"
        ? "http://localhost:5000"
        : import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true
});

export default api;