import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROLES } from '../../constants/roles';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES],
    },
    {
      title: 'Products',
      icon: Package,
      path: '/dashboard/products',
      roles: [ROLES.ADMIN, ROLES.MANAGER],
      subItems: [
        { title: 'All Products', path: '/dashboard/products' },
        { title: 'Add New', path: '/dashboard/products/new' },
        { title: 'Categories', path: '/dashboard/categories' },
      ],
    },
    {
      title: 'Categories',
      icon: FolderTree,
      path: '/dashboard/categories',
      roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
    {
      title: 'Quotes',
      icon: FileText,
      path: '/dashboard/quotes',
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES],
      subItems: [
        { title: 'All Quotes', path: '/dashboard/quotes' },
        { title: 'Pending', path: '/dashboard/quotes?status=pending' },
        { title: 'Approved', path: '/dashboard/quotes?status=approved' },
      ],
    },
    {
      title: 'Users',
      icon: Users,
      path: '/dashboard/users',
      roles: [ROLES.ADMIN],
      subItems: [
        { title: 'All Users', path: '/dashboard/users' },
        { title: 'Add User', path: '/dashboard/users/new' },
        { title: 'Roles', path: '/dashboard/users/roles' },
      ],
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      path: '/dashboard/analytics',
      roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
      roles: [ROLES.ADMIN, ROLES.MANAGER],
    },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const isSubItemActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter menu items based on user role
  const visibleItems = menuItems.filter(item => {
    if (user?.role === ROLES.ADMIN) return true;
    return item.roles?.includes(user?.role) || false;
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${!isOpen && 'lg:w-20'}
      `}>
        {/* Logo */}
        <div className={`
          flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800
          ${!isOpen && 'lg:justify-center'}
        `}>
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#C3110C] to-[#E6501B] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OL</span>
              </div>
              <span className="text-lg font-bold text-[#280905] dark:text-white">
                Onasis <span className="text-[#E6501B]">Admin</span>
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-[#C3110C] to-[#E6501B] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OL</span>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className={`
          p-4 border-b border-gray-200 dark:border-gray-800
          ${!isOpen && 'lg:px-2 lg:py-4'}
        `}>
          <div className={`flex items-center ${!isOpen ? 'lg:justify-center' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#C3110C] to-[#E6501B] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.role || 'Administrator'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems?.length > 0;
            const isExpanded = expandedMenus[item.title];
            const active = isActive(item.path);

            return (
              <div key={item.path}>
                {hasSubItems ? (
                  // Menu with sub-items
                  <>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200 group
                        ${active ? 'bg-[#C3110C]/10 text-[#C3110C] dark:bg-[#E6501B]/10 dark:text-[#E6501B]' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                        ${!isOpen && 'lg:justify-center'}
                      `}
                      title={!isOpen ? item.title : ''}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#C3110C] dark:text-[#E6501B]' : 'text-gray-500 dark:text-gray-400'}`} />
                      {isOpen && (
                        <>
                          <span className="flex-1 text-left text-sm font-medium">
                            {item.title}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </button>

                    {/* Sub-items */}
                    {isOpen && isExpanded && (
                      <div className="ml-9 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`
                              block px-3 py-2 text-sm rounded-lg transition-all duration-200
                              ${isSubItemActive(subItem.path)
                                ? 'text-[#C3110C] dark:text-[#E6501B] bg-[#C3110C]/5 dark:bg-[#E6501B]/5'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                              }
                            `}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Single menu item
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200 group
                      ${active ? 'bg-[#C3110C]/10 text-[#C3110C] dark:bg-[#E6501B]/10 dark:text-[#E6501B]' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                      ${!isOpen && 'lg:justify-center'}
                    `}
                    title={!isOpen ? item.title : ''}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#C3110C] dark:text-[#E6501B]' : 'text-gray-500 dark:text-gray-400'}`} />
                    {isOpen && (
                      <span className="text-sm font-medium">
                        {item.title}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom - Logout */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
              transition-all duration-200 group
              ${!isOpen && 'lg:justify-center'}
            `}
            title={!isOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>

        {/* Toggle button - desktop */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full items-center justify-center shadow-md hover:shadow-lg transition-all"
        >
          {isOpen ? (
            <ChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;