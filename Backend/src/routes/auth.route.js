const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const rateLimiter = require("../middleware/rateLimit.middleware");

const router = express.Router();

// Rate Limiters
const registerLimiter = rateLimiter(60, 15); // 10 requests per minute
const loginLimiter = rateLimiter(60, 15);    // 10 login attempts per minute



router.post("/register", registerLimiter, authController.userRegisterController);
router.post("/login", loginLimiter, authController.userLoginController);
router.post("/logout",authMiddleware.authMiddleware,authController.userLogoutController);

module.exports = router;
