🚀 Smart Secure Transfer Backend System

SecureBank-System is a backend-focused banking simulation project designed with production-level architectural thinking.
It ensures atomic transactions, double-entry ledger accounting, risk-based high-value transfer control, and real-time analytics.

🏗️ Core Features
🔐 Authentication

User Registration

User Login

JWT-based Protected Routes

Logout Support

Rate Limiting for security

💳 Account Management

Create Account

Account Status (ACTIVE)

Balance derived using Ledger entries

💸 Smart Secure Transfer Engine
✅ Atomic Transactions

MongoDB Session-based transactions

Prevents partial money movement

Ensures consistency

📒 Double Entry Ledger System

Every transfer creates:

DEBIT entry (sender)

CREDIT entry (receiver)

Provides complete audit trail

🔁 Idempotency Protection

Prevents duplicate transactions

Auto-generates UUID if not provided

⚠️ Risk Engine

High value transaction detection (> ₹50,000)

Risk Score generation

Risk Reason tagging

High-value transfers move to PENDING state

Manual confirmation required

📧 Email Notification System (Nodemailer + OAuth2)

Registration Email

Transaction Success Email

High Value Transaction Alert

Secure Gmail OAuth2 integration

📊 Dashboard Analytics API

Provides:

Total Transactions

Completed Transactions

Pending Transactions

Reversed Transactions

Total Amount Transferred

High Risk Transactions Count

Risk Percentage

Recent 5 Transactions

🔄 Transaction Lifecycle APIs

Create Transaction

Confirm High Value Transaction

Cancel Pending Transaction

Get Pending Transactions

Initial Fund Deposit

Dashboard Statistics

🧠 Architecture Thinking

This project simulates real-world fintech backend principles:

Atomic money transfer logic

Ledger-based accounting model

Risk-controlled transfer approval

Idempotency for reliability

Audit-ready transaction records

Clean separation of concerns (Controllers, Models, Routes, Services)

🛠️ Tech Stack

Node.js

Express.js

MongoDB + Mongoose

JWT Authentication

Nodemailer (OAuth2 Gmail)

Redis (Optional/Config Ready)

Socket.io (Notification Support)

UUID (Idempotency)

📂 Project Structure
Backend/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── services/
 ├── middleware/
 ├── db/
 ├── app.js
 └── server.js
🎯 Why This Project Stands Out

Unlike simple CRUD-based backend projects, this system focuses on:

Data integrity

Financial transaction safety

Risk evaluation logic

Production-style architecture

Scalable structure
