const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");

const router = express.Router();

// Create Account
router.post("/",authMiddleware.authMiddleware,accountController.createAccountController);

// Get Account Balance (Secure)
router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceController);

module.exports = router;
