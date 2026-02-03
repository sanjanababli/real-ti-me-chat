import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Users, Search, User } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesOnlineFilter = showOnlineOnly
      ? onlineUsers.includes(user._id)
      : true;
    return matchesSearch && matchesOnlineFilter;
  });

  const onlineCount = onlineUsers ? onlineUsers.length - 1 : 0;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="w-80 h-full sidebar-surface border-r border-border-subtle flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-text-primary">
              Contacts ({users.length} total)
            </h2>
            <p className="text-sm text-text-muted">
              {onlineCount > 0 ? onlineCount : 0} online
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border-subtle rounded-lg text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Filter Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
            className="w-4 h-4 text-primary bg-muted border-border-subtle rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-sm text-text-secondary">Show online only</span>
        </label>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-6">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-text-muted" />
            </div>
            <p className="text-sm text-text-muted">
              {searchQuery ? "No contacts found" : "No online contacts"}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filteredUsers.map((user) => {
              const isOnline = onlineUsers?.includes(user._id);
              const isSelected = selectedUser?._id === user._id;

              return (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`
                    w-full p-4 flex items-center gap-3 chat-item-hover
                    ${isSelected ? "chat-item-active" : ""}
                    transition-colors duration-150
                  `}
                >
                  {/* Avatar with Status */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden border-2 border-transparent">
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    {/* Online Status Indicator */}
                    {isOnline && (
                      <div className="absolute -bottom-0.5 bg-green-500 -right-0.5 w-4 h-4 status-indicator-online rounded-full border-2 border-card shadow-sm"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-text-primary truncate">
                      {user.fullName}
                    </p>
                    <p className="text-sm text-text-muted">
                      {isOnline ? "Online" : "Offline"}
                    </p>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
