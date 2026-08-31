/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download,
  RefreshCw,
  Trash2,
  Search,
  X,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../libs/utils";
import api from "../../services/api";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import { TableSkeleton, CardListSkeleton } from "../../components/common/Skeleton";

import { DEFAULT_FILTERS, ROLE_OPTIONS, ROLE_CONFIG, STATUS_OPTIONS } from "./constants";
import UserTableHead from "./components/UserTableHead";
import UserTableRow from "./components/UserTableRow";
import UserMobileCard from "./components/UserMobileCard";
import UserFormModal from "./components/UserFormModal";

const Users = () => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
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
  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(async ({ isRefresh = false } = {}) => {
    const requestId = ++requestIdRef.current;
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const result = await api.users.getAll(token, { ...filters, page, limit });
      if (requestId !== requestIdRef.current) return;
      setUsers(result.data);
      setMeta(result.meta);
      setSelectedIds((prev) => prev.filter((id) => result.data.some((u) => u.id === id)));
    } catch {
      if (requestId !== requestIdRef.current) return;
      setError("Something went wrong while fetching users.");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [filters, page, limit, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const searchTimeoutRef = useRef(null);
  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers({ isRefresh: true });
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [filters.search]);

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
      const csv = await api.users.exportCSV(token, filters);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users-export-${new Date().toISOString().slice(0, 10)}.csv`);
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

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allSelected = users.length > 0 && users.every((u) => selectedIds.includes(u.id));
    setSelectedIds(
      allSelected
        ? selectedIds.filter((id) => !users.some((u) => u.id === id))
        : [...new Set([...selectedIds, ...users.map((u) => u.id)])]
    );
  };

  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await api.users.bulkDelete(token, selectedIds);
      toast.success(`${selectedIds.length} user(s) deleted.`);
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
        await api.users.update(token, editingUser.id, form);
        toast.success("User updated successfully.");
      } else {
        await api.users.create(token, form);
        toast.success("User created successfully.");
      }
      setFormOpen(false);
      setEditingUser(null);
      fetchUsers({ isRefresh: true });
    } catch {
      toast.error(editingUser ? "Failed to update user." : "Failed to create user.");
    }
  };

  const handleStatusChange = async (user, status) => {
    try {
      await api.users.updateStatus(token, user.id, status);
      toast.success(`${user.name}'s status set to ${status}.`);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status } : u)));
    } catch {
      toast.error("Failed to update user status.");
    }
  };

  const confirmDeleteUser = async () => {
    setDeleting(true);
    try {
      await api.users.delete(token, deleteTarget.id);
      toast.success("User deleted successfully.");
      setDeleteTarget(null);
      fetchUsers({ isRefresh: true });
    } catch {
      toast.error("Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = filters.search !== "" || filters.role !== "all" || filters.status !== "all";
  const allSelected = users.length > 0 && users.every((u) => selectedIds.includes(u.id));

  // Theme-aware classes
  const cardClasses = cn(
    "border rounded-xl overflow-hidden",
    isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"
  );
  const headerText = isDark ? "text-white" : "text-gray-900";
  const subText = isDark ? "text-gray-400" : "text-gray-500";
  const borderColor = isDark ? "border-[#2A2A2A]" : "border-gray-200";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${headerText}`}>Users Management</h1>
          <p className={`mt-1 text-sm ${subText}`}>Manage your team members and their permissions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setEditingUser(null); setFormOpen(true); }}
            className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 cursor-pointer",
              isDark
                ? "border-[#2A2A2A] text-gray-300 hover:bg-[#242424]"
                : "border-gray-200 text-gray-700 hover:bg-gray-100"
            )}
          >
            <Download className={cn("w-4 h-4", exporting && "animate-bounce")} />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 cursor-pointer",
              isDark
                ? "border-[#2A2A2A] text-gray-300 hover:bg-[#242424]"
                : "border-gray-200 text-gray-700 hover:bg-gray-100"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} /> Refresh
          </button>
          <button
            onClick={() => selectedIds.length > 0 && setBulkDeleteOpen(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
              selectedIds.length > 0
                ? "border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                : cn(isDark ? "border-[#2A2A2A] text-gray-500" : "border-gray-200 text-gray-400", "cursor-not-allowed")
            )}
          >
            <Trash2 className="w-4 h-4" /> Bulk Delete
            {selectedIds.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold">
                {selectedIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Card: filters + table + pagination */}
      <div className={cardClasses}>
        {/* Filters */}
        <div className={`p-4 border-b ${borderColor} space-y-3`}>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
                placeholder="Search by name or email..."
                aria-label="Search users"
                className={cn(
                  "w-full pl-9 pr-8 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition",
                  isDark
                    ? "bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                )}
              />
              {filters.search && (
                <button
                  onClick={() => handleFiltersChange({ ...filters, search: "" })}
                  aria-label="Clear search"
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md",
                    isDark ? "text-gray-400 hover:bg-[#2A2A2A]" : "text-gray-400 hover:bg-gray-100"
                  )}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select
              value={filters.role}
              onChange={(e) => handleFiltersChange({ ...filters, role: e.target.value })}
              aria-label="Filter by role"
              className={cn(
                "lg:w-40 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition",
                isDark
                  ? "bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  : "bg-white border-gray-200 text-gray-900"
              )}
            >
              <option value="all">All Roles</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{ROLE_CONFIG[r]?.label || r}</option>
              ))}
            </select>
            <select
              value={filters.status}
              onChange={(e) => handleFiltersChange({ ...filters, status: e.target.value })}
              aria-label="Filter by status"
              className={cn(
                "lg:w-40 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition",
                isDark
                  ? "bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  : "bg-white border-gray-200 text-gray-900"
              )}
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
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

        {/* Table / Content */}
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
                <UserTableHead allSelected={false} onToggleSelectAll={() => {}} disabled />
                <TableSkeleton rows={8} columns={7} />
              </table>
            </div>
            <div className="md:hidden p-4"><CardListSkeleton rows={5} /></div>
          </>
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description={hasActiveFilters ? "Try adjusting your search or filters." : "No team members have been added yet."}
            actionLabel={hasActiveFilters ? "Clear Filters" : "Add User"}
            onAction={hasActiveFilters ? () => handleFiltersChange(DEFAULT_FILTERS) : () => setFormOpen(true)}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <UserTableHead
                  allSelected={allSelected}
                  onToggleSelectAll={toggleSelectAll}
                />
                <tbody>
                  {users.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      isSelected={selectedIds.includes(user.id)}
                      onSelect={toggleSelect}
                      onEdit={(u) => { setEditingUser(u); setFormOpen(true); }}
                      onDelete={setDeleteTarget}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className={cn("md:hidden divide-y", isDark ? "divide-[#2A2A2A]" : "divide-gray-100")}>
              {users.map((user) => (
                <UserMobileCard
                  key={user.id}
                  user={user}
                  isSelected={selectedIds.includes(user.id)}
                  onSelect={toggleSelect}
                  onEdit={(u) => { setEditingUser(u); setFormOpen(true); }}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && !error && users.length > 0 && (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            totalRecords={meta.total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(next) => { setLimit(next); setPage(1); }}
            itemLabel="users"
          />
        )}
      </div>

      {/* Modals */}
      <UserFormModal
        open={formOpen}
        user={editingUser}
        onSave={handleSaveUser}
        onCancel={() => { setFormOpen(false); setEditingUser(null); }}
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
        description="This will permanently remove the selected users."
        confirmLabel="Delete"
        danger
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
};

export default Users;