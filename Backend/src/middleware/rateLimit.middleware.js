const crypto = require("crypto");
const redisClient = require("../db/redis");

const rateLimiter = (windowSizeInSeconds, maxRequests) => {

  return async (req, res, next) => {
    try {

      const route = req.baseUrl + (req.route?.path || "");
      const identifier = req.user?.id || req.ip;

      const key = `rate:${identifier}:${route}`;

      const currentTime = Math.floor(Date.now() / 1000);
      const windowStart = currentTime - windowSizeInSeconds;

      // Remove old requests outside window
      await redisClient.zRemRangeByScore(key, 0, windowStart);

      const requestCount = await redisClient.zCard(key);

      if (requestCount >= maxRequests) {
        return res.status(429).json({
          message: "Too many requests. Please try again later."
        });
      }

      const uniqueValue = crypto.randomBytes(16).toString("hex");

      await redisClient.zAdd(key, [{
        score: currentTime,
        value: `${currentTime}-${uniqueValue}`
      }]);

      await redisClient.expire(key, windowSizeInSeconds);

      next();

    } catch (err) {
      console.error("Rate Limit Error:", err);
      next(); // Fail safe
    }
  };
};

module.exports = rateLimiter;
