const mongoose = require("mongoose");
const transactionModel = require("../models/transaction.model");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service")

/*
  Create Transaction API Flow

  1. Validate input
  2. Verify accounts
  3. Validate idempotency key
  4. Check account status
  5. Check sender balance
  6. Create transaction (PENDING)
  7. Create ledger entries
  8. Mark transaction COMPLETED
  9. Commit session
*/

async function createTransaction(req, res) {

  /* ---------- Step 1: Validate Input ---------- */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "fromAccount, toAccount, amount and idempotencyKey are required"
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      message: "Amount must be greater than zero"
    });
  }

  /* ---------- Step 2: Verify Accounts ---------- */
  const fromUserAccount = await accountModel.findById(fromAccount);
  const toUserAccount = await accountModel.findById(toAccount);

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount"
    });
  }

  /* ---------- Step 3: Validate Idempotency Key ---------- */
  const existingTransaction = await transactionModel.findOne({ idempotencyKey });

  if (existingTransaction) {

    if (existingTransaction.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: existingTransaction
      });
    }

    if (existingTransaction.status === "PENDING") {
      return res.status(409).json({
        message: "Transaction is already in progress"
      });
    }

    if (existingTransaction.status === "FAILED") {
      return res.status(400).json({
        message: "Previous transaction attempt failed"
      });
    }

    if (existingTransaction.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry"
      });
    }
  }

  /* ---------- Step 4: Check Account Status ---------- */
  if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
    return res.status(400).json({
      message: "Both accounts must be ACTIVE"
    });
  }

  /* ---------- Step 5: Check Sender Balance ---------- */
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}.Requested amount ${amount}`
    });
  }

 /* ---------- Step 6: Start MongoDB Session ---------- */
const session = await mongoose.startSession();

try {
  session.startTransaction();

  /* ---------- Step 7: Create Transaction (PENDING) ---------- */
  const transaction = await transactionModel.create([{
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING"
  }], { session });

  const createdTransaction = transaction[0];

  /* ---------- Step 8: Create Ledger Entries ---------- */

  // Debit sender
  await ledgerModel.create([{
    account: fromAccount,
    transaction: createdTransaction._id,
    amount,
    type: "DEBIT"
  }], { session });

  // Credit receiver
  await ledgerModel.create([{
    account: toAccount,
    transaction: createdTransaction._id,
    amount,
    type: "CREDIT"
  }], { session });

  /* ---------- Step 9: Mark Transaction COMPLETED ---------- */
  createdTransaction.status = "COMPLETED";
  await createdTransaction.save({ session });

  /* ---------- Step 10: Commit Transaction ---------- */
  await session.commitTransaction();

  /* ---------- Step 11: Emit Real-Time Notification ---------- */
  const io = req.app.get("io");

  io.emit("transactionNotification", {
    message: "Transaction successful",
    transactionId: createdTransaction._id,
    amount,
    fromAccount,
    toAccount
  });

  /* ---------- Step 12: Send Email Notification ---------- */
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

  /* ---------- If Anything Fails ---------- */
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




module.exports = {
  createTransaction,
  initialFunds,
  
};
