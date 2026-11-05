import { useTheme } from "../../../context/ThemeContext";

const UserTableHead = ({ allSelected, onToggleSelectAll, disabled = false }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <thead>
      <tr className={`border-b text-left text-xs font-semibold uppercase tracking-wide ${
        isDark ? "border-[#2A2A2A] text-gray-400" : "border-gray-200 text-gray-500"
      }`}>
        <th className="px-4 py-3 w-10">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleSelectAll}
            disabled={disabled}
            aria-label="Select all users"
            className="rounded border-gray-300 dark:border-[#2A2A2A] text-[#C3110C] focus:ring-[#C3110C]"
          />
        </th>
        <th className="px-4 py-3">User</th>
        <th className="px-4 py-3">Email</th>
        <th className="px-4 py-3">Role</th>
        <th className="px-4 py-3">Status</th>
        <th className="px-4 py-3">Department</th>
        <th className="px-4 py-3">Last Login</th>
        <th className="px-4 py-3 text-right">Actions</th>
      </tr>
    </thead>
  );
};

export default UserTableHead;