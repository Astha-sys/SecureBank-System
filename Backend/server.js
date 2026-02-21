require("dotenv").config();

const connectDB = require("./src/db/db");
const redisClient = require("./src/db/redis");
const app = require("./src/app");

const http = require("http");
const { Server } = require("socket.io");

async function startServer() {
  try {
    await connectDB();
    console.log("Database connected");

    await redisClient.connect();
    console.log("Redis connected");

    //  Create HTTP server from Express app
    const server = http.createServer(app);

    //  Attach Socket.IO
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:8080",
        credentials: true
      }
    });

    //  Make io accessible inside routes/controllers
    app.set("io", io);

    //  WebSocket connection listener
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    //   Start server (IMPORTANT: use server.listen, not app.listen)
    server.listen(3000, () => {
      console.log("Server is listening at port 3000");
    });

  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

startServer();