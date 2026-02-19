require("dotenv").config();

const connectDB = require("./src/db/db");
const redisClient = require("./src/db/redis");
const app = require("./src/app");

async function startServer() {
  try {
    await connectDB();
    console.log("Database connected");

    await redisClient.connect();
    console.log("Redis connected");

    app.listen(3000, () => {
      console.log("Server is listening at port 3000");
    });

  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

startServer();
