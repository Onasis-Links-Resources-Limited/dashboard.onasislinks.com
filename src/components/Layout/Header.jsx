import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Menu, 
  Bell, 
  Search, 
  Sun, 
  Moon,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'New quote request from John Doe', time: '2 min ago', read: false },
    { id: 2, title: 'Product "Fiber Optic Cable" out of stock', time: '1 hour ago', read: false },
    { id: 3, title: 'Quote Q-001 approved', time: '3 hours ago', read: true },
    { id: 4, title: 'New user registered: Jane Smith', time: '5 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-[#1A1A1A] border-[#2A2A2A] border-b border-black- dark:border-[#1A1A1A]   flex items-center justify-between px-4 lg:px-6 flex-shrink-0 shadow-md">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[#1A1A1A] dark:hover:bg-[#1A1A1A] border-[#2A2A2A]  transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 w-64 border  border-[#2A2A2A] border-b border-black- dark:border-[#1A1A1A] rounded-lg bg-[#1A1A1A]  text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#C3110C] focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[#1A1A1A] dark:hover:bg-[#1A1A1A] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-400 hover:text-yellow-500 transition-colors  hover:bg-red-50 dark:hover:bg-red-900/20"/>
          ) : (
            <Moon className="w-5 h-5 text-gray-600 hover:text-gray-900 transition-colors" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg  transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300  hover:bg-red-50 dark:hover:bg-red-900/20" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1A1A1A]  rounded-lg shadow-lg border border-gray-200 dark:border-[#1A1A1A]  overflow-hidden z-50">
              <div className="p-3 border-b border-[#1A1A1A] dark:border:-[#1A1A1A] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <button className="text-xs text-[#C3110C] hover:text-[#E6501B]">Mark all read</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b border-[#1A1A1A] dark:border-[#1A1A1A] hover:bg-[#1A1A1A] dark:hover:bg-[#1A1A1A] cursor-pointer transition-colors ${
                      !notification.read ? 'bg-[#C3110C]/5 dark:bg-[#E6501B]/5' : ''
                    }`}
                  >
                    <p className="text-sm text-gray-800 dark:text-gray-200">{notification.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 text-center border-t border-gray-200 dark:border-[#1A1A1A] ">
                <button className="text-xs text-[#C3110C] hover:text-[#E6501B] font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A]  transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C3110C] to-[#E6501B] flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#1A1A1A] dark:bg-[#1A1A1A] rounded-lg shadow-lg border border-[#1A1A1A] dark:border-[#1A1A1A] hover:bg-[#1A1A1A] dark:hover:bg-[#1A1A1A] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'admin@onasislinks.com'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-[#C3110C]/10 text-[#C3110C] dark:bg-[#E6501B]/10 dark:text-[#E6501B] text-xs font-medium rounded-full">
                  {user?.role || 'Administrator'}
                </span>
              </div>
              <div className="py-1">
                <Link
                  to="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;