import { ShieldAlert } from "lucide-react";
import {
  ROLES,
  ROLE_LABELS,
  ROLE_COLORS,
  ROLE_ICONS,
  PERMISSIONS,
} from "../../../constants/roles";

const PERMISSION_LABELS = {
  canManageProducts: "Manage Products",
  canManageCategories: "Manage Categories",
  canManageUsers: "Manage Users",
  canManageRoles: "Manage Roles",
  canManageQuotes: "Manage Quotes",
  canViewAnalytics: "View Analytics",
  canDeleteAny: "Delete Any Record",
  canEditAny: "Edit Any Record",
};

const Check = ({ granted }) =>
  granted ? (
    <span className="inline-flex w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 items-center justify-center text-xs font-bold">
      ✓
    </span>
  ) : (
    <span className="inline-flex w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 items-center justify-center text-xs">
      —
    </span>
  );

/**
 * Read-only by design. Permissions are enforced server-side and in
 * AuthContext.hasPermission() straight from constants/roles.js — making
 * this grid "editable" without a backend behind it would let an admin
 * toggle a checkbox here that changes nothing about what that role can
 * actually do, which is worse than not having the control at all.
 *
 * When a real permissions API exists, wire the checkboxes to it directly
 * against this same PERMISSIONS shape — no other file needs to change.
 */
const RolesSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          This is a reference view of the permissions defined in code (
          <code>src/constants/roles.js</code>) and enforced by every protected
          route and action. Changing role capabilities currently requires a code
          change — ask engineering to update this list rather than expecting a
          toggle here to take effect.
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Roles & Permissions
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          What each role can see and do across the dashboard.
        </p>

        <div className="space-y-8">
          {Object.values(ROLES).map((role) => (
            <div key={role}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: `${ROLE_COLORS[role]}1A`,
                    color: ROLE_COLORS[role],
                  }}
                >
                  {ROLE_ICONS[role]}
                </span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {ROLE_LABELS[role]}
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 pl-8">
                {Object.entries(PERMISSIONS[role]).map(([key, granted]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <Check granted={granted} />
                    <span className="text-gray-600 dark:text-gray-300">
                      {PERMISSION_LABELS[key] || key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RolesSettings;
