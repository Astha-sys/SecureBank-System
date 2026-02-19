const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const rateLimiter = require("./middleware/rateLimit.middleware"); // ✅ require first

const authRouter = require("./routes/auth.route");
const accountRouter = require("./routes/account.route");
const transactionRouter = require("./routes/transaction.route");

const app = express();
app.set("trust proxy", 1);


// Core Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

// Global Rate Limiter
app.use(rateLimiter(60, 200));


// Routes
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);

module.exports = app;
