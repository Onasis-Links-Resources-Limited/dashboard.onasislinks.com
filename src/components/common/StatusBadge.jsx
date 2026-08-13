import React from "react";

const STATUS_MAP = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-300",
  },
  quoted: {
    label: "Quoted",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-300",
  },
  approved: {
    label: "Approved",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-300",
  },
  completed: {
    label: "Completed",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-300",
  },
  expired: {
    label: "Expired",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-400",
  },
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

const StatusBadge = ({ status = "pending", size = "md" }) => {
  const cfg = STATUS_MAP[status] || {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-700",
  };
  const sizeClasses =
    size === "sm"
      ? "text-xs px-2.5 py-0.5 rounded-full"
      : "text-sm px-3 py-1 rounded-full";
  return (
    <span
      className={`${cfg.bg} ${cfg.text} ${sizeClasses} font-medium inline-flex items-center`}
    >
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
