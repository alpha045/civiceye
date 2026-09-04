import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
  import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : (import.meta.env.DEV ? "http://localhost:5001" : (typeof window !== "undefined" ? window.location.origin : ""))
);

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true,
  reconnectionAttempts: 5,
  timeout: 10000,
});

export default socket;