const mongoose = require("mongoose");
const transactionModel = require("../models/transaction.model");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const { v4: uuidv4 } = require("uuid");



async function createTransaction(req, res) {

  /* ---------- Step 1: Validate Input ---------- */
  let { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount) {
    return res.status(400).json({
      message: "fromAccount, toAccount and amount are required"
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      message: "Amount must be greater than zero"
    });
  }

  //  Auto-generate idempotency key if not provided
  if (!idempotencyKey) {
    idempotencyKey = uuidv4();
  }

  /* ---------- Step 2: Verify Accounts ---------- */
  const fromUserAccount = await accountModel.findById(fromAccount);
  const toUserAccount = await accountModel.findById(toAccount);

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount"
    });
  }

  /* ---------- Step 3: Idempotency ---------- */
  const existingTransaction = await transactionModel.findOne({ idempotencyKey });

  if (existingTransaction) {
    return res.status(200).json({
      message: "Transaction already exists",
      transaction: existingTransaction
    });
  }

  /* ---------- Step 4: Account Status ---------- */
  if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
    return res.status(400).json({
      message: "Both accounts must be ACTIVE"
    });
  }

  /* ---------- Step 5: Balance Check ---------- */
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}`
    });
  }

  /* ---------- Risk Engine ---------- */
  const HIGH_VALUE_LIMIT = 50000;

  let riskScore = 0;
  let riskReason = "Normal Transaction";
  let isHighValue = false;

  if (amount > HIGH_VALUE_LIMIT) {
    riskScore = 40;
    riskReason = "High Amount Transaction";
    isHighValue = true;
  }

  /* ---------- Start MongoDB Session ---------- */
  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    /* ---------- Create Transaction ---------- */
    const transaction = await transactionModel.create([{
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: isHighValue ? "PENDING" : "COMPLETED",
      riskScore,
      riskReason
    }], { session });

    const createdTransaction = transaction[0];

    /* ---------- If NOT High Value → Process Ledger ---------- */
    if (!isHighValue) {

      await ledgerModel.create([{
        account: fromAccount,
        transaction: createdTransaction._id,
        amount,
        type: "DEBIT"
      }], { session });

      await ledgerModel.create([{
        account: toAccount,
        transaction: createdTransaction._id,
        amount,
        type: "CREDIT"
      }], { session });
    }

   await session.commitTransaction();
  
    /* ---------- High Value Response ---------- */
    if (isHighValue) {

  try {
    await emailService.sendHighValueAlertEmail(
      req.user?.email,
      req.user?.username,
      amount
    );
  } catch (emailError) {
    console.error("High value email failed:", emailError.message);
  }

  return res.status(202).json({
    message: "High value transaction pending confirmation",
    transaction: createdTransaction
  });
   }

    /* ---------- Normal Success Flow ---------- */

    const io = req.app.get("io");

    io.emit("transactionNotification", {
      message: "Transaction successful",
      transactionId: createdTransaction._id,
      amount
    });

    try {
      await emailService.sendTransactionEmail(
        req.user?.email,
        req.user?.username,
        amount,
        toUserAccount._id
      );
    } catch (emailError) {
      console.error("Email failed:", emailError.message);
    }

    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction: createdTransaction
    });

  } catch (error) {

    await session.abortTransaction();

    return res.status(500).json({
      message: "Transaction failed",
      error: error.message
    });

  } finally {
    session.endSession();
  }
}

async function initialFunds(req, res) {

  const { accountId, amount } = req.body;

  if (!accountId || !amount) {
    return res.status(400).json({
      message: "accountId and amount are required"
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      message: "Amount must be greater than zero"
    });
  }

  const account = await accountModel.findById(accountId);

  if (!account) {
    return res.status(400).json({
      message: "Invalid accountId"
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const transaction = await transactionModel.create([{
      fromAccount: accountId,   // since required in model
      toAccount: accountId,
      amount,
      idempotencyKey: `INIT-${Date.now()}`,
      status: "PENDING"
    }], { session });

    const createdTransaction = transaction[0];

    await ledgerModel.create([{
      account: accountId,
      transaction: createdTransaction._id,
      amount,
      type: "CREDIT"
    }], { session });

    createdTransaction.status = "COMPLETED";
    await createdTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    const updatedBalance = await account.getBalance();

    return res.status(201).json({
      message: "Balance added successfully",
      balance: updatedBalance
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      message: error.message
    });
  }
}

async function confirmTransaction(req, res) {

  const { transactionId } = req.params;

  const transaction = await transactionModel.findById(transactionId);

  if (!transaction) {
    return res.status(404).json({
      message: "Transaction not found"
    });
  }

  if (transaction.status !== "PENDING") {
    return res.status(400).json({
      message: "Transaction is not pending"
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    // Debit sender
    await ledgerModel.create([{
      account: transaction.fromAccount,
      transaction: transaction._id,
      amount: transaction.amount,
      type: "DEBIT"
    }], { session });

    // Credit receiver
    await ledgerModel.create([{
      account: transaction.toAccount,
      transaction: transaction._id,
      amount: transaction.amount,
      type: "CREDIT"
    }], { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();

    // Emit socket
    const io = req.app.get("io");
    io.emit("transactionNotification", {
      message: "High value transaction confirmed",
      transactionId: transaction._id,
      amount: transaction.amount
    });

    return res.status(200).json({
      message: "Transaction confirmed successfully",
      transaction
    });

  } catch (error) {

    await session.abortTransaction();

    return res.status(500).json({
      message: "Confirmation failed",
      error: error.message
    });

  } finally {
    session.endSession();
  }
}

async function getPendingTransactions(req, res) {
  try {
    const pendingTransactions = await transactionModel
      .find({ status: "PENDING" })
      .populate("fromAccount toAccount");

    return res.status(200).json({
      count: pendingTransactions.length,
      transactions: pendingTransactions
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch pending transactions",
      error: error.message
    });
  }
}

async function cancelTransaction(req, res) {

  const { transactionId } = req.params;

  const transaction = await transactionModel.findById(transactionId);

  if (!transaction) {
    return res.status(404).json({
      message: "Transaction not found"
    });
  }

  if (transaction.status !== "PENDING") {
    return res.status(400).json({
      message: "Only pending transactions can be cancelled"
    });
  }

  transaction.status = "REVERSED";
  await transaction.save();

  return res.status(200).json({
    message: "Transaction cancelled successfully",
    transaction
  });
}

async function getDashboardStats(req, res) {
  try {

    const totalTransactions = await transactionModel.countDocuments();
    const completedTransactions = await transactionModel.countDocuments({ status: "COMPLETED" });
    const pendingTransactions = await transactionModel.countDocuments({ status: "PENDING" });
    const reversedTransactions = await transactionModel.countDocuments({ status: "REVERSED" });

    // Total money transferred (only completed)
    const totalTransferredAgg = await transactionModel.aggregate([
      { $match: { status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalAmountTransferred = totalTransferredAgg[0]?.total || 0;

    // High risk transactions
    const highRiskTransactions = await transactionModel.countDocuments({
      riskScore: { $gt: 0 }
    });

    // Risk percentage
    const riskPercentage =
      totalTransactions > 0
        ? ((highRiskTransactions / totalTransactions) * 100).toFixed(2)
        : 0;

    // Latest 5 transactions
    const recentTransactions = await transactionModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      reversedTransactions,
      totalAmountTransferred,
      highRiskTransactions,
      riskPercentage,
      recentTransactions
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message
    });
  }
}




module.exports = {
  createTransaction,
  initialFunds,
  confirmTransaction,
  getPendingTransactions,
  cancelTransaction,
  getDashboardStats
  
};
