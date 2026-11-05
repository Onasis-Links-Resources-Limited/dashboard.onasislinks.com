import { cn } from "../../libs/utils";

const USER_STATUS_CONFIG = {
  active: {
    label: "Active",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
  },
  inactive: {
    label: "Inactive",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-400",
  },
  suspended: {
    label: "Suspended",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-300",
  },
};

const UserStatusBadge = ({ status, size = "md", className }) => {
  const config = USER_STATUS_CONFIG[status] || USER_STATUS_CONFIG.suspended;
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        config.bg,
        config.text,
        sizes[size],
        className,
      )}
    >
      {config.label}
    </span>
  );
};

export default UserStatusBadge;
