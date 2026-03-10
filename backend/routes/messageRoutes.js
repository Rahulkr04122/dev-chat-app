const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");

// ─── @route   GET /api/messages/global ────────
// ─── @desc    Get all global messages ──────────
// ─── @access  Private ─────────────────────────
router.get("/global", protect, async (req, res) => {
  try {
    const messages = await Message.find({ messageType: "global" })
      .populate("sender", "username email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// ─── @route   GET /api/messages/private/:userId ──
// ─── @desc    Get private messages between two users
// ─── @access  Private ─────────────────────────
router.get("/private/:userId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      messageType: "private",
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .populate("sender", "username email")
      .populate("receiver", "username email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// ─── @route   POST /api/messages/global ───────
// ─── @desc    Save a global message ───────────
// ─── @access  Private ─────────────────────────
router.post("/global", protect, async (req, res) => {
  const { content } = req.body;

  try {
    const message = await Message.create({
      sender: req.user._id,
      content,
      isGlobal: true,
      messageType: "global",
    });

    // Populate sender details before sending back
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username email"
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// ─── @route   POST /api/messages/private ──────
// ─── @desc    Save a private message ──────────
// ─── @access  Private ─────────────────────────
router.post("/private", protect, async (req, res) => {
  const { content, receiverId } = req.body;

  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      isGlobal: false,
      messageType: "private",
    });

    // Populate sender and receiver details before sending back
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username email")
      .populate("receiver", "username email");

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

module.exports = router;