const User = require("../models/User");
const Message = require("../models/Message");

const socketHandler = (io) => {
  // ─── Store online users ────────────────────
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // ─── User joins ───────────────────────────
    socket.on("user_connected", async (userId) => {
      // Store user in online users map
      onlineUsers.set(userId, socket.id);

      // Update user status in database
      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Broadcast updated online users list to everyone
      io.emit("online_users", Array.from(onlineUsers.keys()));

      console.log(`👤 User ${userId} is now online`);
    });

    // ─── Global message ───────────────────────
    socket.on("send_global_message", async (data) => {
      const { content, senderId, senderName } = data;

      try {
        // Save message to database
        const message = await Message.create({
          sender: senderId,
          content,
          isGlobal: true,
          messageType: "global",
        });

        // Populate sender details
        const populatedMessage = await Message.findById(message._id).populate(
          "sender",
          "username email"
        );

        // Broadcast message to everyone
        io.emit("receive_global_message", populatedMessage);
      } catch (error) {
        console.error("❌ Error saving global message:", error.message);
      }
    });

    // ─── Private message ──────────────────────
    socket.on("send_private_message", async (data) => {
      const { content, senderId, receiverId } = data;

      try {
        // Save message to database
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content,
          isGlobal: false,
          messageType: "private",
        });

        // Populate sender and receiver details
        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "username email")
          .populate("receiver", "username email");

        // Send message only to receiver
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "receive_private_message",
            populatedMessage
          );
        }

        // Also send back to sender
        socket.emit("receive_private_message", populatedMessage);
      } catch (error) {
        console.error("❌ Error saving private message:", error.message);
      }
    });

    // ─── Typing indicator ─────────────────────
    socket.on("typing", (data) => {
      const { senderId, receiverId, isGlobal, senderName } = data;

      if (isGlobal) {
        // Broadcast typing to everyone except sender
        socket.broadcast.emit("user_typing", { senderId, senderName });
      } else {
        // Send typing only to receiver
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("user_typing", { senderId, senderName });
        }
      }
    });

    // ─── Stop typing indicator ────────────────
    socket.on("stop_typing", (data) => {
      const { senderId, receiverId, isGlobal } = data;

      if (isGlobal) {
        socket.broadcast.emit("user_stop_typing", { senderId });
      } else {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("user_stop_typing", { senderId });
        }
      }
    });

    // ─── User disconnects ─────────────────────
    socket.on("disconnect", async () => {
      // Find which user disconnected
      let disconnectedUserId = null;

      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
        }
      });

      if (disconnectedUserId) {
        // Remove from online users map
        onlineUsers.delete(disconnectedUserId);

        // Update user status in database
        await User.findByIdAndUpdate(disconnectedUserId, { isOnline: false });

        // Broadcast updated online users list
        io.emit("online_users", Array.from(onlineUsers.keys()));

        console.log(`👤 User ${disconnectedUserId} is now offline`);
      }

      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;