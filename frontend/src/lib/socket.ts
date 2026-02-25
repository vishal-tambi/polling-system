import { io } from 'socket.io-client';

// Create a single shared socket instance for the whole app
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// We don't connect yet — we connect after the user picks a role
const socket = io(BACKEND_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket", "polling"], // Reliable fallback
});

export default socket;
