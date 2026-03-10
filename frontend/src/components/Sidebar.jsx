import { useAuth } from "../context/AuthContext";

const Sidebar = ({ onlineUsers, users, selectedUser, onSelectUser, onGlobalChat }) => {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-gray-800 h-screen flex flex-col">

      {/* Header */}
      <div className="p-4 bg-gray-900 border-b border-gray-700">
        <h1 className="text-white font-bold text-xl">💬 Dev Chat</h1>
        <p className="text-gray-400 text-sm mt-1">@{user?.username}</p>
      </div>

      {/* Global Chat Button */}
      <div className="p-3 border-b border-gray-700">
        <button
          onClick={onGlobalChat}
          className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition duration-200 ${
            selectedUser === null
              ? "bg-blue-600 text-white"
              : "text-gray-300 hover:bg-gray-700"
          }`}
        >
          🌍 Global Chat
        </button>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-gray-500 text-xs uppercase font-bold mb-3 px-2">
          All Users
        </p>

        {users.length === 0 && (
          <p className="text-gray-500 text-sm px-2">No other users found</p>
        )}

        {users.map((u) => (
          <button
            key={u._id}
            onClick={() => onSelectUser(u)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition duration-200 flex items-center gap-3 ${
              selectedUser?._id === u._id
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            {/* Online Indicator */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                {u.username[0].toUpperCase()}
              </div>
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                  onlineUsers.includes(u._id) ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </div>

            {/* Username */}
            <div>
              <p className="font-semibold text-sm">{u.username}</p>
              <p className="text-xs text-gray-400">
                {onlineUsers.includes(u._id) ? "Online" : "Offline"}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition duration-200"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;