import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Menu,
  Bell,
  Sun,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Moon,
} from "lucide-react";
import { AVATARS } from "../../data/avatar";
import ProfileModal from "../ProfileModal";

const Header = ({ toggleSidebar }) => {
  const { user, logout, updateUserAvatar } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12)
      return {
        text: "Good Morning",
        mood: "Rise and shine! Ready to make today great?",
      };
    if (hour < 17)
      return {
        text: "Good Afternoon",
        mood: "Halfway through! Keep up the great work.",
      };
    if (hour < 21)
      return {
        text: "Good Evening",
        mood: "Winding down? Just a few more tasks!",
      };
    return { text: "Good Night", mood: "Get some rest, you have earned it!" };
  };
  const greeting = getGreeting();

  const notifications = [
    {
      id: 1,
      title: "New quote request from John Doe",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      title: 'Product "Fiber Optic Cable" out of stock',
      time: "1 hour ago",
      read: false,
    },
    { id: 3, title: "Quote Q-001 approved", time: "3 hours ago", read: true },
    {
      id: 4,
      title: "New user registered: Jane Smith",
      time: "5 hours ago",
      read: true,
    },
  ];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getAvatarSrc = () => {
    // 1. Priority: Backend uploaded image
    if (user?.avatar_url) return { src: user.avatar_url, isCustom: true };

    // 2. Fallback: Pre-selected array avatar
    if (user?.avatar) {
      const found = AVATARS.find((a) => a.id === user.avatar);
      if (found) return { src: found.src, isCustom: false };
    }

    // 3. Default: Null (will trigger initials)
    return null;
  };

  const avatarData = getAvatarSrc();

  const currentAvatar = user?.avatar
    ? AVATARS.find((a) => a.id === user.avatar)
    : null;

  return (
    <header className="h-16 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-gray-400" />
        </button>
        <div className="hidden lg:flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-white">
              {greeting.text},
            </span>
            <span className="text-lg font-semibold text-gray-200">
              {user?.first_name ? `${user.first_name}` : user.role}
            </span>
          </div>
          <span className="text-sm text-gray-500 -mt-0.5">{greeting.mood}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-gray-400 hover:text-yellow-500 transition-colors" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-colors" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#C3110C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1A1A1A] rounded-lg shadow-xl border border-[#2A2A2A] overflow-hidden z-50">
              <div className="p-3 border-b border-[#2A2A2A] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Notifications
                </h3>
                <button className="text-xs text-[#C3110C] hover:text-[#E6501B] transition">
                  Mark all read
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-[#2A2A2A] hover:bg-white/5 cursor-pointer ${!notification.read ? "bg-[#C3110C]/5" : ""}`}
                  >
                    <p className="text-sm text-gray-200">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#2A2A2A] border border-[#3A3A3A] overflow-hidden flex-shrink-0">
              {avatarData ? (
                <img
                  src={avatarData.src}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if the image link breaks
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-r from-[#C3110C] to-[#E6501B] flex items-center justify-center text-white font-semibold text-sm">${user?.first_name?.charAt(0) || "A"}</div>`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#C3110C] to-[#E6501B] flex items-center justify-center text-white font-semibold text-sm">
                  {user?.first_name?.charAt(0) || "A"}
                </div>
              )}
            </div>
            <span className="hidden sm:block text-sm text-gray-300">
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ""}`
                : "Admin"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#1A1A1A] rounded-lg shadow-xl border border-[#2A2A2A] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#2A2A2A]">
                <p className="text-sm font-medium text-white">
                  {user?.first_name
                    ? `${user.first_name} ${user.last_name || ""}`
                    : "Admin User"}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.email || "admin@onasislinks.com"}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-[#C3110C]/10 text-[#C3110C] text-xs font-medium rounded-full capitalize">
                  {user?.role || "Administrator"}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors text-left"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <hr className="my-1 border-[#2A2A2A]" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Include the Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        updateUserAvatar={updateUserAvatar}
      />
    </header>
  );
};

export default Header;
