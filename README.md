# SecureBank

A Full-Stack Banking System with Secure Authentication & Ledger-Based Transactions

SecureBank is a modern full-stack banking application built with a focus on authentication security, transaction integrity, and scalable backend architecture.

It demonstrates real-world backend practices including JWT authentication, secure cookies, password hashing, email integration, and ledger-based financial tracking.

🚀 Key Features


🔐 Secure Authentication System

JWT-based authentication

HTTP-only secure cookies

Password hashing with bcrypt

Protected dashboard routes

Proper CORS configuration

Token validation middleware

📧 Nodemailer Integration (Exclusive Feature)

Welcome email sent upon successful registration

SMTP-based email server setup

Modular email service architecture

Safe email handling (does not break user registration if email fails)

Environment-secured credentials

🏦 Banking Core System

Multi-account support per user

Savings & Current account types

Account balance tracking

Credit money functionality

Debit money functionality

Insufficient balance validation

Real-time balance updates (API level)

🧾 Ledger-Based Transaction System

Every transaction recorded permanently

CREDIT / DEBIT classification

Timestamped transaction history

Account-to-ledger relationship modeling

Designed for future MongoDB transactions

💻 Frontend Architecture

React + Vite + TypeScript

Clean modular structure

Axios API integration

Context-based authentication state

Protected dashboard UI

Modern responsive design

🛠 Tech Stack
Backend

Node.js

Express.js

MongoDB

Mongoose

JWT

bcrypt

Nodemailer

dotenv

Frontend

React

Vite

TypeScript

Axios

Tailwind / Shadcn UI (if applicable)
