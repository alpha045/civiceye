import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { connectDB } from "./config/db.js";

import { initSocket, io } from "./lib/socket.js";

const PORT = process.env.PORT || 5001;

// CREATE SERVER
export const server = http.createServer(app);

// SOCKET SETUP
initSocket(server);
export { io };

// START SERVER AFTER DB CONNECT
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`CivicEye API Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });