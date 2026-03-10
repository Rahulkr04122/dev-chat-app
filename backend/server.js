const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

// Load environment variables from .env file
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Import socket handler
const socketHandler = require("./socket/socketHandler");

// Initialize express app
const app = express();

// Create HTTP server (required for Socket.IO)
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// ─── Middleware ───────────────────────────────
// ─── Middleware ───────────────────────────────
app.use(cors({
  origin: [
    "https://dev-chat-app-sepia.vercel.app",
    "https://dev-chat-app-git-main-rahulkr04122-9055s-projects.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ─── Test Route ───────────────────────────────
app.get("/", (req, res) => {
  res.send("🚀 Dev Chat App Backend is Running!");
});

// ─── Socket.IO ────────────────────────────────
socketHandler(io);

// ─── Connect to MongoDB ───────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });