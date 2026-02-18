const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require("../services/email.service");

/**
 * - user register controller
 * - post /api/auth/register
 */

async function userRegisterController(req, res) {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const isExists = await userModel.findOne({
      email: normalizedEmail
    });

    if (isExists) {
      return res.status(422).json({
        message: "Email already exists.",
        status: "failed"
      });
    }

    // Create user
    const user = await userModel.create({
      username,
      email: normalizedEmail,
      password
    });

    // Send Registration Email (safe handling)
    try {
      await emailService.sendRegistrationEmail(
        user.email,
        user.username
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // We don't stop registration if email fails
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username
      },
      token
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}


/**
 * - user login controller
 * - post /api/auth/login
 */

async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required."
      });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await userModel
      .findOne({ email: normalizedEmail })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Email or password is INVALID."
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Email or password is INVALID."
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        username: user.username
      },
      token
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}

module.exports = {
  userRegisterController,
  userLoginController
};
