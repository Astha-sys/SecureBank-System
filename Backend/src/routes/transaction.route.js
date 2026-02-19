const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller")



const transactionRouter = express.Router();

// POST /api/transaction    creates a new transaction

transactionRouter.post("/", authMiddleware.authMiddleware,transactionController.createTransaction)
transactionRouter.post("/initial-funds",authMiddleware.authMiddleware,transactionController.initialFunds);







module.exports = transactionRouter;
