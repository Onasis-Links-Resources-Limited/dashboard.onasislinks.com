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
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
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
        { title: 'Add New', path: '/dashboard/products/add' },
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
    },
    {
      title: 'Users',
      icon: Users,
      path: '/dashboard/users',
      roles: [ROLES.ADMIN],
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
        w-64 bg-[#1A1A1A] border-[#2A2A2A] shadow-2xl dark:bg-[#1A1A1A] dark:border-[#2A2A2A]
        border-r border-black- dark:border-[#1A1A1A] border-[#2A2A2A]
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
            <div className="flex items-center justify-center mx-auto gap-3 p-2">
              <img 
                src="/images/logo.png" 
                alt="Onasis Admin Logo" 
                className="w-full h-10" 
              />
            </div>
          ) : (
            <img 
              src="/images/logo3.png" 
              alt="Onasis Admin Logo" 
              className=""
            />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
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
                        ${active ? 'bg-[#C3110C]/10 text-[#C3110C] dark:bg-[#E6501B]/10 dark:text-[#E6501B]' : 'text-gray-600 dark:text-gray-300  hover:bg-red-50 dark:hover:bg-red-900/20'}
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
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white   hover:bg-red-50 dark:hover:bg-red-900/20'
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
                      ${active ? 'bg-[#C3110C]/10 text-[#C3110C] dark:bg-[#E6501B]/10 dark:text-[#E6501B]' : 'text-gray-600 dark:text-gray-300  hover:bg-red-50 dark:hover:bg-red-900/20'}
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
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[#1A1A1A] border-[#2A2A2A] border  rounded-full items-center justify-center shadow-md hover:shadow-lg transition-all"
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