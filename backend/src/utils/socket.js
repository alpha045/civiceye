import { io } from "socket.io-client";

// Explicitly point to your backend port 5001
const BACKEND_URL = "http://localhost:5001";

const socket = io(BACKEND_URL, {
  withCredentials: true,
  autoConnect: true,
});

// Debug logs to verify connection states in your browser console
socket.on("connect", () => {
  console.log("✅ Successfully connected to Socket.io server! ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket Connection Error:", error.message);
});

export default socket;