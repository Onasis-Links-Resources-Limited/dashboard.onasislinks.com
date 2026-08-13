/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Download,
  RefreshCw,
  Trash2,
  Search,
  X,
  Pencil,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import userAPI, { ROLE_OPTIONS, STATUS_OPTIONS } from "../../api/userAPI";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { cn, formatDate } from "../../libs/utils";
import StatusBadge from "../../components/common/StatusBadge";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import {
  TableSkeleton,
  CardListSkeleton,
} from "../../components/common/Skeleton.jsx";

const DEFAULT_FILTERS = {
  search: "",
  role: "all",
  status: "all",
  sortBy: "joinedDate",
  sortOrder: "desc",
};

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-300",
  },
  manager: {
    label: "Manager",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-300",
  },
  sales: {
    label: "Sales",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
  },
  tech: {
    label: "Technical",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-800 dark:text-orange-300",
  },
  viewer: {
    label: "Viewer",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-400",
  },
};

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
        config.bg,
        config.text,
      )}
    >
      {config.label}
    </span>
  );
};

const inputClasses =
  "w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 py-2 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition";

// --- Add / Edit modal --------------------------------------------------------

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  department: "",
  role: "viewer",
  status: "active",
};

const UserFormModal = ({ open, user, onSave, onCancel }) => {
  const { theme } = useTheme();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!user;

  useEffect(() => {
    if (open) {
      setForm(
        user
          ? {
              name: user.name,
              email: user.email,
              phone: user.phone || "",
              department: user.department || "",
              role: user.role,
              status: user.status,
            }
          : EMPTY_FORM,
      );
      setErrors({});
    }
  }, [open, user]);

  if (!open) return null;

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      next.name = "Please enter a valid name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Please enter a valid email address.";
    if (!form.role) next.role = "Please select a role.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/50 ${theme === "dark" ? "dark" : ""}`}
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {isEdit ? "Edit User" : "New User"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Close"
            className="p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="John Doe"
              className={cn(inputClasses, errors.name && "border-red-400")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="john@onasisltd.com"
              className={cn(inputClasses, errors.email && "border-red-400")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+234 801 234 5678"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Department
              </label>
              <input
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="Management"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Role *
              </label>
              <select
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className={inputClasses}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_CONFIG[r].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputClasses}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 text-xs text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Module-level permissions (read/write/delete/approve) are derived
              from the selected role and can be fine-tuned in a future update.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] transition-colors disabled:opacity-50"
          >
            {saving && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {isEdit ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
};

// --- Page --------------------------------------------------------------------

const Users = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const requestIdRef = useRef(0);

  const fetchUsers = useCallback(
    async ({ isRefresh = false } = {}) => {
      const requestId = ++requestIdRef.current;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const result = await userAPI.getAll({ ...filters, page, limit });
        if (requestId !== requestIdRef.current) return;
        setUsers(result.data);
        setMeta(result.meta);
        setSelectedIds((prev) =>
          prev.filter((id) => result.data.some((u) => u.id === id)),
        );
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError("Something went wrong while fetching users.");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [filters, page, limit],
  );

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, limit]);

  const handleFiltersChange = (next) => {
    setFilters(next);
    setPage(1);
  };

  const handleRefresh = () => {
    if (refreshing || loading) return;
    fetchUsers({ isRefresh: true });
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const csv = await userAPI.exportCSV(filters);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users-export-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Users exported successfully.");
    } catch {
      toast.error("Failed to export users.");
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  const toggleSelectAll = () => {
    const allSelected =
      users.length > 0 && users.every((u) => selectedIds.includes(u.id));
    setSelectedIds(
      allSelected
        ? selectedIds.filter((id) => !users.some((u) => u.id === id))
        : [...new Set([...selectedIds, ...users.map((u) => u.id)])],
    );
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      toast.warning("Select at least one user to delete.");
      return;
    }
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await userAPI.bulkDelete(selectedIds);
      toast.success(
        `${selectedIds.length} user${selectedIds.length > 1 ? "s" : ""} deleted successfully.`,
      );
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      fetchUsers({ isRefresh: true });
    } catch {
      toast.error("Failed to delete users.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSaveUser = async (form) => {
    try {
      if (editingUser) {
        await userAPI.update(editingUser.id, form);
        toast.success("User updated successfully.");
      } else {
        await userAPI.create(form);
        toast.success("User created successfully.");
      }
      setFormOpen(false);
      setEditingUser(null);
      fetchUsers({ isRefresh: true });
    } catch {
      toast.error(
        editingUser ? "Failed to update user." : "Failed to create user.",
      );
    }
  };

  const handleStatusChange = async (user, status) => {
    try {
      await userAPI.toggleStatus(user.id, status);
      toast.success(`${user.name}'s status set to ${status}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status } : u)),
      );
    } catch {
      toast.error("Failed to update user status.");
    }
  };

  const confirmDeleteUser = async () => {
    setDeleting(true);
    try {
      await userAPI.delete(deleteTarget.id);
      toast.success("User deleted successfully.");
      setDeleteTarget(null);
      fetchUsers({ isRefresh: true });
    } catch {
      toast.error("Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters =
    filters.search !== "" || filters.role !== "all" || filters.status !== "all";
  const allSelected =
    users.length > 0 && users.every((u) => selectedIds.includes(u.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Users Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Manage your team members and their permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingUser(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Download
              className={cn("w-4 h-4", exporting && "animate-bounce")}
            />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={cn("w-4 h-4", refreshing && "animate-spin")}
            />
            Refresh
          </button>
          <button
            onClick={handleBulkDeleteClick}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
              selectedIds.length > 0
                ? "border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800",
            )}
          >
            <Trash2 className="w-4 h-4" />
            Bulk Delete
            {selectedIds.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold">
                {selectedIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Card: filters + table + pagination */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  handleFiltersChange({ ...filters, search: e.target.value })
                }
                placeholder="Search by name/email..."
                aria-label="Search users"
                className={cn("pl-9 pr-8", inputClasses)}
              />
              {filters.search && (
                <button
                  onClick={() =>
                    handleFiltersChange({ ...filters, search: "" })
                  }
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select
              value={filters.role}
              onChange={(e) =>
                handleFiltersChange({ ...filters, role: e.target.value })
              }
              aria-label="Filter by role"
              className={cn("lg:w-40", inputClasses)}
            >
              <option value="all">All Roles</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {ROLE_CONFIG[r].label}
                </option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) =>
                handleFiltersChange({ ...filters, status: e.target.value })
              }
              aria-label="Filter by status"
              className={cn("lg:w-40", inputClasses)}
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => handleFiltersChange(DEFAULT_FILTERS)}
              className="text-xs font-medium text-[#C3110C] dark:text-[#E6501B] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Table / states */}
        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Unable to load users."
            description={error}
            actionLabel="Try Again"
            onAction={() => fetchUsers()}
          />
        ) : loading ? (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <UsersTableHead
                  allSelected={false}
                  onToggleSelectAll={() => {}}
                  disabled
                />
                <TableSkeleton rows={8} columns={7} />
              </table>
            </div>
            <div className="md:hidden p-4">
              <CardListSkeleton rows={5} />
            </div>
          </>
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description={
              hasActiveFilters
                ? "Try adjusting your search or filters."
                : "No team members have been added yet."
            }
            actionLabel={hasActiveFilters ? "Clear Filters" : "Add User"}
            onAction={
              hasActiveFilters
                ? () => handleFiltersChange(DEFAULT_FILTERS)
                : () => setFormOpen(true)
            }
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <UsersTableHead
                  allSelected={allSelected}
                  onToggleSelectAll={toggleSelectAll}
                />
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          aria-label={`Select ${user.name}`}
                          className="rounded border-gray-300 dark:border-gray-600 text-[#C3110C] focus:ring-[#C3110C]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt=""
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-700 dark:text-gray-300">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.department}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.status}
                          onChange={(e) =>
                            handleStatusChange(user, e.target.value)
                          }
                          aria-label={`Status for ${user.name}`}
                          className="text-xs border-0 bg-transparent font-medium cursor-pointer focus:ring-2 focus:ring-[#C3110C] rounded"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                        <div className="mt-0.5">
                          <StatusBadge status={user.status} size="sm" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatDate(user.joinedDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setFormOpen(true);
                            }}
                            aria-label={`Edit ${user.name}`}
                            title="Edit"
                            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#C3110C] dark:hover:text-[#E6501B] transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
                            aria-label={`Delete ${user.name}`}
                            title="Delete"
                            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        aria-label={`Select ${user.name}`}
                        className="mt-1.5 rounded border-gray-300 dark:border-gray-600 text-[#C3110C] focus:ring-[#C3110C] flex-shrink-0"
                      />
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-9 h-9 rounded-full flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={user.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <RoleBadge role={user.role} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(user.joinedDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-2 -mr-1.5">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setFormOpen(true);
                      }}
                      aria-label={`Edit ${user.name}`}
                      className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(user)}
                      aria-label={`Delete ${user.name}`}
                      className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !error && users.length > 0 && (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            totalRecords={meta.total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(next) => {
              setLimit(next);
              setPage(1);
            }}
            itemLabel="users"
          />
        )}
      </div>

      <UserFormModal
        open={formOpen}
        user={editingUser}
        onSave={handleSaveUser}
        onCancel={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.name}?`}
        description="This will permanently remove this user's account. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDeleteUser}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Delete ${selectedIds.length} user${selectedIds.length > 1 ? "s" : ""}?`}
        description="This will permanently remove the selected users. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
};

const UsersTableHead = ({
  allSelected,
  onToggleSelectAll,
  disabled = false,
}) => (
  <thead>
    <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      <th className="px-4 py-3 w-10">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleSelectAll}
          disabled={disabled}
          aria-label="Select all users"
          className="rounded border-gray-300 dark:border-gray-600 text-[#C3110C] focus:ring-[#C3110C]"
        />
      </th>
      <th className="px-4 py-3">User</th>
      <th className="px-4 py-3">Email</th>
      <th className="px-4 py-3">Role</th>
      <th className="px-4 py-3">Status</th>
      <th className="px-4 py-3">Joined</th>
      <th className="px-4 py-3 text-right">Actions</th>
    </tr>
  </thead>
);

export default Users;
