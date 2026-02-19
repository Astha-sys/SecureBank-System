const express = require('express');
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

// Routes
const authRouter = require('./routes/auth.route');
const accountRouter = require("./routes/account.route");
const transactionRouter = require('./routes/transaction.route');  // 👈 ADD THIS

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRouter);  // 👈 ADD THIS

module.exports = app;
