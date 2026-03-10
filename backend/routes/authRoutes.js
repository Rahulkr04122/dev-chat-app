const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// ─── Generate JWT Token ───────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ─── @route   POST /api/auth/register ─────────
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "❌ User already exists" });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Send back user data with token
    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "❌ Server error", error: error.message });
  }
});

// ─── @route   POST /api/auth/login ────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      return res
        .status(401)
        .json({ message: "❌ Invalid email or password" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "❌ Server error", error: error.message });
  }
});

// ─── @route   GET /api/auth/users ─────────────
router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "❌ Server error", error: error.message });
  }
});

module.exports = router;