import { Pencil, Trash2 } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { formatDate } from "../../../libs/utils";
import UserAvatar from "./UserAvatar";
import RoleBadge from "./RoleBadge";
import UserStatusBadge from "../../../components/common/UserStatusBadge";

const UserMobileCard = ({
  user,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`p-4 ${isDark ? "border-[#2A2A2A]" : "border-gray-100"} border-b`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(user.id)}
            aria-label={`Select ${user.name}`}
            className="mt-1.5 rounded border-gray-300 dark:border-[#2A2A2A] text-[#C3110C] focus:ring-[#C3110C] shrink-0"
          />
          <UserAvatar 
            name={user.name} 
            avatarUrl={user.avatar || user.avatar_url} 
            size="md"
          />
          <div className="min-w-0">
            <div className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
              {user.name}
            </div>
            <div className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {user.email}
            </div>
          </div>
        </div>
        <UserStatusBadge status={user.status} size="sm" />
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3">
        <RoleBadge role={user.role} />
        <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Dept: {user.department || "—"}
        </span>
        <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Last: {user.last_login ? formatDate(user.last_login) : "Never"}
        </span>
      </div>

      <div className="flex items-center justify-end gap-1 mt-3 -mr-1.5">
        <button
          onClick={() => onEdit(user)}
          aria-label={`Edit ${user.name}`}
          className={`p-1.5 rounded-md transition-colors ${
            isDark
              ? "text-gray-400 hover:bg-[#2A2A2A] hover:text-[#E6501B]"
              : "text-gray-500 hover:bg-gray-100 hover:text-[#C3110C]"
          }`}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(user)}
          aria-label={`Delete ${user.name}`}
          className={`p-1.5 rounded-md transition-colors ${
            isDark
              ? "text-gray-400 hover:bg-[#2A2A2A] hover:text-red-400"
              : "text-gray-500 hover:bg-gray-100 hover:text-red-600"
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UserMobileCard;