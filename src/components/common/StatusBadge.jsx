import { cn } from "../../libs/utils";

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-800 dark:text-teal-300",
  },
  expired: {
    label: "Expired",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-400",
  },
  quoted: {
    label: "Quoted",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-800 dark:text-indigo-300",
  },
  pending: {
    label: "Pending",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-300",
  },
  accepted: {
    label: "Accepted",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
  },
  pending_email_approval: {
    label: "Pending Email Approval",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-300",
  },
  pending_pac_approval: {
    label: "Pending PAC Approval",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-300",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-300",
  },
};

const DEFAULT_STATUS = {
  label: "Unknown",
  bg: "bg-gray-100 dark:bg-gray-800",
  text: "text-gray-700 dark:text-gray-400",
};

const StatusBadge = ({ status, size = "md", className }) => {
  const config = STATUS_CONFIG[status] || DEFAULT_STATUS;
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

export default StatusBadge;
