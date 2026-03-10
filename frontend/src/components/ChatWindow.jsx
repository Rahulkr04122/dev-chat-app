import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const ChatWindow = ({ messages, selectedUser, typingUsers }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // ─── Auto scroll to bottom ────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Format time ──────────────────────────────
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 h-screen">

      {/* Chat Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
          {selectedUser ? selectedUser.username[0].toUpperCase() : "🌍"}
        </div>
        <div>
          <h2 className="text-white font-bold">
            {selectedUser ? selectedUser.username : "Global Chat"}
          </h2>
          <p className="text-gray-400 text-sm">
            {selectedUser ? "Private Message" : "Everyone can see this"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-lg">
              No messages yet. Say Hello! 👋
            </p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMyMessage = msg.sender._id === user._id ||
            msg.sender === user._id;

          return (
            <div
              key={index}
              className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                  isMyMessage ? "items-end" : "items-start"
                } flex flex-col`}
              >
                {/* Sender Name */}
                {!isMyMessage && (
                  <p className="text-gray-400 text-xs mb-1 px-1">
                    {msg.sender.username || "Unknown"}
                  </p>
                )}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isMyMessage
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-700 text-white rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>

                {/* Timestamp */}
                <p className="text-gray-500 text-xs mt-1 px-1">
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-none">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                <p className="text-gray-400 text-xs ml-2">
                  {typingUsers[0]} is typing...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;