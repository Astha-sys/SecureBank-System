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
const authRouter = require('./routes/auth.route');      // Auth routes
const accountRouter = require("./routes/account.route"); // Account routes

app.use('/api/auth', authRouter);        // Authentication APIs
app.use('/api/accounts', accountRouter); // Account APIs

module.exports = app;
