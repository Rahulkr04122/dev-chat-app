import { useState } from "react";

const MessageInput = ({ onSendMessage, onTyping, onStopTyping }) => {
  const [message, setMessage] = useState("");
  let typingTimeout = null;

  // ─── Handle typing indicator ──────────────────
  const handleChange = (e) => {
    setMessage(e.target.value);

    // Tell others user is typing
    onTyping();

    // Stop typing after 2 seconds of no input
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      onStopTyping();
    }, 2000);
  };

  // ─── Handle send message ──────────────────────
  const handleSend = () => {
    if (message.trim() === "") return;
    onSendMessage(message);
    setMessage("");
    onStopTyping();
  };

  // ─── Handle Enter key ─────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-gray-800 border-t border-gray-700">
      <div className="flex items-center gap-3">

        {/* Input Field */}
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-gray-700 text-white rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={message.trim() === ""}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white w-12 h-12 rounded-full flex items-center justify-center transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>

      </div>
      <p className="text-gray-500 text-xs mt-2 text-center">
        Press Enter to send • Shift + Enter for new line
      </p>
    </div>
  );
};

export default MessageInput;