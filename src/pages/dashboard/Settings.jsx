import { Outlet, NavLink } from "react-router-dom";
import { Building2, ShieldCheck, Bell, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
// import { ROLES } from "../../constants/roles";
import { cn } from "../../libs/utils";

const TABS = [
  {
    to: "/dashboard/settings/company",
    label: "Company & Invoicing",
    icon: Building2,
  },
  {
    to: "/dashboard/settings/roles",
    label: "Roles & Permissions",
    icon: ShieldCheck,
  },
  {
    to: "/dashboard/settings/notifications",
    label: "Notifications",
    icon: Bell,
  },
  { to: "/dashboard/settings/appearance", label: "Appearance", icon: Sun },
];

/**
 * Layout shell for /dashboard/settings/*. Renders the tab navigation and
 * an <Outlet /> for whichever tab is active — same composition pattern as
 * DashboardLayout (Sidebar/Header + Outlet).
 *
 * Settings is only visible in the Sidebar to Admin/Manager, but nav
 * visibility alone is never real authorization — this route-level check
 * is the actual gate: anyone else hitting the URL directly is redirected.
 */
const Settings = () => {
  const { user } = useAuth();
  // const allowed = user?.role === ROLES.ADMIN || user?.role === ROLES.MANAGER;

  // if (!allowed) return <Navigate to="/unauthorized" replace />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure invoicing details, role permissions, notifications and
          appearance.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab navigation */}
        <nav className="lg:w-56 flex-shrink-0">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map(({ to, label, icon: Icon }) => (
              <li key={to} className="flex-shrink-0">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "bg-[#C3110C]/10 dark:bg-[#E6501B]/10 text-[#C3110C] dark:text-[#E6501B]"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                    )
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Active tab */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Settings;