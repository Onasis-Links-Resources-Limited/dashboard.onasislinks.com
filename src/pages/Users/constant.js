export const ROLE_OPTIONS = ["admin", "manager", "sales", "tech", "viewer", "customer"];
export const STATUS_OPTIONS = ["active", "inactive", "suspended"];

export const DEFAULT_FILTERS = {
  search: "",
  role: "all",
  status: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const ROLE_CONFIG = {
  admin: { label: "Admin", bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-800 dark:text-purple-300" },
  manager: { label: "Manager", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-300" },
  sales: { label: "Sales", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300" },
  tech: { label: "Technical", bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-800 dark:text-orange-300" },
  viewer: { label: "Viewer", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400" },
  customer: { label: "Customer", bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-800 dark:text-cyan-300" },
};

export const STATUS_CONFIG = {
  active: { label: "Active", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300" },
  inactive: { label: "Inactive", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400" },
  suspended: { label: "Suspended", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-300" },
};