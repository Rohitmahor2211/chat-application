import axiox from 'axios'

const api = axiox.create({
    baseURL: "http://localhost:5000",
    withCredentials: true
})

export default api;