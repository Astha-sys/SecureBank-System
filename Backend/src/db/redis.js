const { createClient } = require("redis");

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.log("Redis retry limit reached.");
        return new Error("Retry limit reached");
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err.message);
});



redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

module.exports = redisClient;
