import { Pencil, Trash2 } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { formatDate } from "../../../libs/utils";
import UserAvatar from "./UserAvatar";
import RoleBadge from "./RoleBadge";
import UserStatusBadge from "../../../components/common/UserStatusBadge";

const UserTableRow = ({
  user,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <tr
      className={`border-b transition-colors ${
        isDark
          ? "border-[#2A2A2A] hover:bg-[#242424]"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <td className="px-4 py-3 w-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(user.id)}
          aria-label={`Select ${user.name}`}
          className="rounded border-gray-300 dark:border-[#2A2A2A] text-[#C3110C] focus:ring-[#C3110C]"
        />
      </td>
      <td className="px-2 py-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={user.name}
            avatarUrl={user.avatar || user.avatar_url}
            size="md"
          />
          <div className="min-w-0">
            <div
              className={`font-medium truncate text-sm ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {user.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-2 py-3">
        <div
          className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {user.email}
        </div>
        <div
          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          {user.phone || "No phone"}
        </div>
      </td>
      <td className="px-2 py-3">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-2 py-3">
        <div className="flex flex-col gap-1">
          <UserStatusBadge status={user.status} size="sm" />
          <select
            value={user.status}
            onChange={(e) => onStatusChange(user, e.target.value)}
            aria-label={`Status for ${user.name}`}
            className={`text-xs border-0 bg-transparent font-medium cursor-pointer focus:ring-2 focus:ring-[#C3110C] rounded ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {["active", "inactive", "suspended"].map((s) => (
              <option key={s} value={s} className={`${isDark ? "bg-[#1A1A1A]" : "bg-white"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className="px-2 py-3 flex justify-center">
        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
          {user.department || "—"}
        </span>
      </td>
      <td className="px-2 py-3 whitespace-nowrap">
        <span
          className={isDark ? "text-gray-400 text-xs" : "text-gray-500 text-xs"}
        >
          {user.last_login ? formatDate(user.last_login) : "Never"}
        </span>
      </td>
      <td className="px-2 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => onEdit(user)}
            aria-label={`Edit ${user.name}`}
            title="Edit"
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
            title="Delete"
            className={`p-1.5 rounded-md transition-colors ${
              isDark
                ? "text-gray-400 hover:bg-[#2A2A2A] hover:text-red-400"
                : "text-gray-500 hover:bg-gray-100 hover:text-red-600"
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserTableRow;