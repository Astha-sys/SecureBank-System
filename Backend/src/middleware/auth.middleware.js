const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const redisClient = require("../db/redis");

async function authMiddleware(req, res, next) {

  const token =
    req.cookies.token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing"
    });
  }

  try {

    // Check Redis Blacklist
    const isBlacklisted = await redisClient.exists(`blacklist:${token}`);

      if (isBlacklisted) {
        return res.status(401).json({
          message: "Token is blacklisted"
        });
      }


    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    req.user = user;

    return next();

  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid"
    });
  }
}

module.exports = { authMiddleware };
