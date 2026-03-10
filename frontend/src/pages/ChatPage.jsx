import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import socket from "../socket/socket";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const ChatPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const selectedUserRef = useRef(null);

  // ─── Connect socket on mount ──────────────────
  useEffect(() => {
    // Connect socket
    socket.connect();

    // Tell server this user is online
    socket.emit("user_connected", user._id);

    // Listen for online users updates
    socket.on("online_users", (onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });

    // Listen for global messages
    socket.on("receive_global_message", (message) => {
      if (!selectedUserRef.current) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Listen for private messages
    socket.on("receive_private_message", (message) => {
      if (selectedUserRef.current) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Listen for typing indicator
    socket.on("user_typing", ({ senderId, senderName }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(senderName)) {
          return [...prev, senderName];
        }
        return prev;
      });
    });

    // Listen for stop typing
    socket.on("user_stop_typing", () => {
      setTypingUsers([]);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socket.off("online_users");
      socket.off("receive_global_message");
      socket.off("receive_private_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, []);

  // ─── Update ref when selectedUser changes ─────
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ─── Fetch all users ──────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // ─── Fetch messages when selectedUser changes ──
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const url = selectedUser
          ? `${BACKEND_URL}/api/messages/private/${selectedUser._id}`
          : `${BACKEND_URL}/api/messages/global`;

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // ─── Send message ─────────────────────────────
  const handleSendMessage = (content) => {
    if (selectedUser) {
      socket.emit("send_private_message", {
        content,
        senderId: user._id,
        receiverId: selectedUser._id,
      });
    } else {
      socket.emit("send_global_message", {
        content,
        senderId: user._id,
        senderName: user.username,
      });
    }
  };

  // ─── Typing indicators ────────────────────────
  const handleTyping = () => {
    socket.emit("typing", {
      senderId: user._id,
      senderName: user.username,
      receiverId: selectedUser?._id,
      isGlobal: !selectedUser,
    });
  };

  const handleStopTyping = () => {
    socket.emit("stop_typing", {
      senderId: user._id,
      receiverId: selectedUser?._id,
      isGlobal: !selectedUser,
    });
  };

  // ─── Select user for private chat ─────────────
  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setTypingUsers([]);
  };

  // ─── Go to global chat ────────────────────────
  const handleGlobalChat = () => {
    setSelectedUser(null);
    setTypingUsers([]);
  };

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onlineUsers={onlineUsers}
        users={users}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        onGlobalChat={handleGlobalChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatWindow
          messages={messages}
          selectedUser={selectedUser}
          typingUsers={typingUsers}
        />
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
        />
      </div>
    </div>
  );
};

export default ChatPage;