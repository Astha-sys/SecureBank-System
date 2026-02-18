const nodemailer = require("nodemailer");

/* ----------------------------------------------------
   Create Gmail Transporter (OAuth2)
---------------------------------------------------- */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

/* ----------------------------------------------------
   Verify Email Connection
---------------------------------------------------- */

transporter.verify((error) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

/* ----------------------------------------------------
   Core Send Email Function
---------------------------------------------------- */

const sendEmail = async (to, subject, text, html) => {
  const info = await transporter.sendMail({
    from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log("Email sent:", info.messageId);
};

/* ----------------------------------------------------
   Registration Email
---------------------------------------------------- */

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger – Your Account is Ready";

  const text = `Hi ${name},

Welcome to Backend Ledger!

Your account has been successfully created and is now ready to use.

We are committed to providing you with a secure and seamless transaction experience.

If you need assistance, our team is always here to help.

Warm regards,
Backend Ledger Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.6;">
    <h2 style="color:#2c3e50;">Welcome to Backend Ledger</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your account has been successfully created and is now ready to use.</p>
    <p>We are committed to providing you with a secure and seamless transaction experience.</p>
    <p>If you need assistance, our support team is happy to help.</p>
    <br/>
    <p>Warm regards,<br/>
    <strong>Backend Ledger Team</strong></p>
  </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

/* ----------------------------------------------------
   Transaction Success Email
---------------------------------------------------- */

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Confirmation – Successfully Processed";

  const text = `Hi ${name},

Your transaction of ₹${amount} has been successfully processed.

Recipient Account: ${toAccount}

The transaction has been securely recorded in our system.

Thank you for trusting Backend Ledger.

Best regards,
Backend Ledger Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.6;">
    <h2 style="color:#27ae60;">Transaction Successful</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your transaction of <strong>₹${amount}</strong> has been successfully processed.</p>
    <p><strong>Recipient Account:</strong> ${toAccount}</p>
    <p>This transaction has been securely recorded in our system.</p>
    <br/>
    <p>Thank you for choosing <strong>Backend Ledger</strong>.</p>
    <p><strong>Backend Ledger Team</strong></p>
  </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

/* ----------------------------------------------------
   Transaction Failure Email
---------------------------------------------------- */

async function sendTransactionFailureEmail(userEmail, name, amount) {
  const subject = "Transaction Update Action Required";

  const text = `Hi ${name},

We regret to inform you that your transaction of ₹${amount} could not be completed.

No funds have been deducted from your account.

Please try again or contact support if the issue persists.

Sincerely,
Backend Ledger Team`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.6;">
    <h2 style="color:#c0392b;">Transaction Not Completed</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your transaction of <strong>₹${amount}</strong> could not be completed.</p>
    <p>No funds have been deducted.</p>
    <p>Please try again or contact support if the issue continues.</p>
    <br/>
    <p>Sincerely,<br/>
    <strong>Backend Ledger Team</strong></p>
  </div>
  `;

  await sendEmail(userEmail, subject, text, html);
}

/* ----------------------------------------------------
   Export All Functions
---------------------------------------------------- */

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
