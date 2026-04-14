import { io } from "socket.io-client";

const URL =
    import.meta.env.MODE === "development"
        ? `http://${window.location.hostname}:5000`
        : import.meta.env.VITE_API_URL;

export const socket = io(URL, {
    auth: (cb) => {
        cb({ token: localStorage.getItem("token") });
    },
    withCredentials: true,
    transports: ["websocket"] // important for production
});


