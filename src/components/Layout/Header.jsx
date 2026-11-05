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
  BellRing,
} from "lucide-react";
import { AVATARS } from "../../data/avatar";
import ProfileModal from "../ProfileModal";
import { useNotifications } from "../../context/NotificationContext";
import { useToast } from "../../context/ToastContext";
import {
  isPushSupported,
  getPushPermission,
  subscribeToPush,
} from "../../libs/push";

const Header = ({ toggleSidebar }) => {
  const { user, logout, updateUserAvatar } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const token = localStorage.getItem("token");
  const isDark = theme === "dark";
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;
    const updatePushState = () => {
      const dismissed = localStorage.getItem("push-prompt-dismissed");
      const perm = getPushPermission();
      if (perm === "default" && !dismissed) setShowPrompt(true);
      setPushEnabled(perm === "granted");
    };

    const timeoutId = setTimeout(updatePushState, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleEnablePush = async () => {
    // ✅ uses token + toast
    if (!token) {
      toast.error("Please sign in again.");
      return;
    }
    setEnablingPush(true);
    try {
      await subscribeToPush(token);
      setPushEnabled(true);
      setShowPrompt(false);
      toast.success(
        "Notifications enabled — you'll get alerts even in other tabs.",
      );
    } catch (err) {
      toast.error(err?.message || "Failed to enable notifications.");
    } finally {
      setEnablingPush(false);
    }
  };

  const handleDismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem("push-prompt-dismissed", "1");
  };

  const {
    items: notifications,
    unread: unreadCount,
    markRead,
    markAllRead,
  } = useNotifications();

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

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now());
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const fmtRelative = (iso) => {
    const d = new Date(iso);
    const diff = (currentTime - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400)
      return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) === 1 ? "" : "s"} ago`;
    return d.toLocaleDateString();
  };

  const severityDot = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-[#C3110C]",
  };

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

  console.log("Unread notifications count:", unreadCount);

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

  return (
    <header
      className={`h-16 ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-[#F9FAFB] border-gray-200"} border-b flex items-center justify-between px-4 lg:px-6 flex-shrink-0 transition-colors`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-colors lg:hidden"
        >
          <Menu
            className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          />
        </button>
        <div className="hidden lg:flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-medium ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {greeting.text},
            </span>
            <span
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {user?.first_name ? `${user.first_name}` : user.role}
            </span>
          </div>
          <span
            className={`text-sm -mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {greeting.mood}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg ${isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"} transition-colors`}
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
            onClick={() => setShowNotifications((v) => !v)}
            className={`p-2 rounded-lg ${isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"} transition-colors relative`}
            aria-label="Notifications"
          >
            {pushEnabled ? (
              <BellRing
                className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              />
            ) : (
              <Bell
                className={`w-5 h-5 ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors`}
              />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-[#C3110C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showPrompt && !showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-72 p-3 rounded-lg border shadow-lg z-50 ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`}
            >
              <p
                className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Enable notifications?
              </p>
              <p
                className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                Get alerts even when you're in another tab or app.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleEnablePush}
                  disabled={enablingPush}
                  className="flex-1 px-3 py-1.5 bg-[#C3110C] hover:bg-[#a80e0a] text-white text-xs font-medium rounded-md disabled:opacity-50"
                >
                  {enablingPush ? "Enabling…" : "Enable"}
                </button>
                <button
                  onClick={handleDismissPrompt}
                  className={`px-3 py-1.5 text-xs ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Not now
                </button>
              </div>
            </div>
          )}

          {showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl border overflow-hidden z-50 ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`}
            >
              <div
                className={`p-3 border-b flex items-center justify-between ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}
              >
                <h3
                  className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[#C3110C] hover:text-[#E6501B] transition"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && (
                  <div
                    className={`p-6 text-center text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    You're all caught up.
                  </div>
                )}

                {notifications.map((n) => {
                  const inner = (
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${severityDot[n.severity] || severityDot.info}`}
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-sm ${isDark ? "text-gray-200" : "text-gray-700"} ${!n.read_at ? "font-medium" : ""}`}
                        >
                          {n.title}
                        </p>
                        {n.message && (
                          <p
                            className={`text-xs mt-0.5 truncate ${isDark ? "text-gray-500" : "text-gray-500"}`}
                          >
                            {n.message}
                          </p>
                        )}
                        <p
                          className={`text-[10px] mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}
                        >
                          {fmtRelative(n.created_at)}
                        </p>
                      </div>
                    </div>
                  );

                  const className = `block p-3 border-b cursor-pointer transition-colors ${isDark ? "border-[#2A2A2A] hover:bg-[#2A2A2A]" : "border-gray-200 hover:bg-gray-50"} ${!n.read_at ? (isDark ? "bg-[#C3110C]/5" : "bg-[#C3110C]/5") : ""}`;

                  return n.link ? (
                    <Link
                      key={n.id}
                      to={n.link}
                      className={className}
                      onClick={() => {
                        markRead(n.id);
                        setShowNotifications(false);
                      }}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      key={n.id}
                      className={className}
                      onClick={() => markRead(n.id)}
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>

              <Link
                to="/dashboard/notifications"
                className={`block text-center text-xs py-2.5 ${isDark ? "text-gray-400 hover:bg-[#2A2A2A]" : "text-gray-500 hover:bg-gray-50"} transition`}
                onClick={() => setShowNotifications(false)}
              >
                View all
              </Link>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"} transition-colors`}
          >
            <div
              className={`w-8 h-8 rounded-full border overflow-hidden flex-shrink-0 ${isDark ? "bg-[#2A2A2A] border-[#3A3A3A]" : "bg-gray-100 border-gray-200"}`}
            >
              {avatarData ? (
                <img
                  src={avatarData.src}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
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
            <span
              className={`hidden sm:block text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ""}`
                : "Admin"}
            </span>
            <ChevronDown
              className={`w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
            />
          </button>

          {showUserMenu && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl border overflow-hidden z-50 ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`}
            >
              <div
                className={`px-4 py-3 border-b ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}
              >
                <p
                  className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {user?.first_name
                    ? `${user.first_name} ${user.last_name || ""}`
                    : "Admin User"}
                </p>
                <p
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
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
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"} transition-colors text-left ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <Link
                  to="/dashboard/settings"
                  className={`flex items-center gap-3 px-4 py-2 text-sm ${isDark ? "hover:bg-[#2A2A2A]" : "hover:bg-gray-100"} transition-colors ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <hr
                  className={`my-1 ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}
                />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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
