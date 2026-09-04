import { Server } from "socket.io";

let ioInstance = null;

export function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

// Proxy so socket emit calls won't crash when running in serverless / stateless environments
export const io = {
  to(room) {
    if (ioInstance) {
      return ioInstance.to(room);
    }
    return {
      emit: () => {},
    };
  },
  emit(...args) {
    if (ioInstance) {
      return ioInstance.emit(...args);
    }
  },
};
