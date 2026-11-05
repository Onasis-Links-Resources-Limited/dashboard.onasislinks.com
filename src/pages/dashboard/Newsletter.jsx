/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Download,
  RefreshCw,
  Trash2,
  Search,
  X,
  Mail,
  MailCheck,
  MailX,
  TrendingUp,
  AlertCircle,
  Users,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { cn, formatDate } from "../../libs/utils";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import {
  TableSkeleton,
  CardListSkeleton,
} from "../../components/common/Skeleton";
import api from "../../services/api";

// ============================================================
// Stats Card Component
// ============================================================
const StatCard = ({ icon: Icon, label, value, color, isDark }) => (
  <div
    className={cn(
      "rounded-xl border p-4 transition-all duration-300",
      isDark
        ? "bg-[#1A1A1A] border-[#2A2A2A]"
        : "bg-white border-gray-200 shadow-sm",
    )}
  >
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg"
        style={{
          backgroundColor: isDark ? `${color}20` : `${color}10`,
          color: color,
        }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p
          className={cn(
            "text-xs font-medium",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "text-xl font-bold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);

// ============================================================
// Status Badge Component
// ============================================================
const StatusBadge = ({ isActive, isDark }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
      isActive
        ? isDark
          ? "bg-green-900/30 text-green-400"
          : "bg-green-100 text-green-700"
        : isDark
          ? "bg-gray-800 text-gray-400"
          : "bg-gray-100 text-gray-600",
    )}
  >
    <span
      className={cn(
        "w-1.5 h-1.5 rounded-full",
        isActive ? "bg-green-500" : "bg-gray-400",
      )}
    />
    {isActive ? "Active" : "Unsubscribed"}
  </span>
);

// ============================================================
// Main Newsletter Component
// ============================================================
const Newsletter = () => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const token = localStorage.getItem("token");

  // State
  const [subscribers, setSubscribers] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    thisMonth: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    sortBy: "subscribed_at",
    sortOrder: "desc",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  const requestIdRef = useRef(0);

  // ============================================================
  // Fetch Subscribers
  // ============================================================
  const fetchSubscribers = useCallback(
    async ({ isRefresh = false } = {}) => {
      const requestId = ++requestIdRef.current;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      try {
        const result = await api.newsletter.getSubscribers(token, {
          ...filters,
          page,
          limit,
        });

        if (requestId !== requestIdRef.current) return;

        setSubscribers(result.data || []);
        setMeta(result.meta || { total: 0, page: 1, limit: 20, totalPages: 1 });
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err.response?.data?.message || "Failed to load subscribers");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [filters, page, limit],
  );

  // ============================================================
  // Fetch Stats
  // ============================================================
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.newsletter.getStats(token);
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [fetchSubscribers, fetchStats]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleFiltersChange = (next) => {
    setFilters(next);
    setPage(1);
  };

  const handleRefresh = () => {
    if (refreshing || loading) return;
    fetchSubscribers({ isRefresh: true });
    fetchStats();
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const blob = await api.newsletter.exportCSV(token, {
        status: filters.status,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Subscribers exported successfully.");
    } catch {
      toast.error("Failed to export subscribers.");
    } finally {
      setExporting(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.newsletter.deleteSubscriber(token, deleteTarget.id);
      toast.success("Subscriber removed successfully.");
      setDeleteTarget(null);
      setDeleteReason("");
      fetchSubscribers({ isRefresh: true });
      fetchStats();
    } catch {
      toast.error("Failed to remove subscriber.");
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = filters.search !== "" || filters.status !== "all";

  // ============================================================
  // Theme Classes
  // ============================================================
  const cardClasses = cn(
    "border rounded-xl overflow-hidden",
    isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200",
  );
  const headerText = isDark ? "text-white" : "text-gray-900";
  const subText = isDark ? "text-gray-400" : "text-gray-500";
  const borderColor = isDark ? "border-[#2A2A2A]" : "border-gray-200";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold", headerText)}>
            Newsletter Subscribers
          </h1>
          <p className={cn("mt-1 text-sm", subText)}>
            Manage your newsletter subscribers and track growth.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 cursor-pointer",
              isDark
                ? "border-[#2A2A2A] text-gray-300 hover:bg-[#212121]"
                : "border-gray-200 text-gray-700 hover:bg-gray-100",
            )}
          >
            <Download
              className={cn("w-4 h-4", exporting && "animate-bounce")}
            />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 cursor-pointer",
              isDark
                ? "border-[#2A2A2A] text-gray-300 hover:bg-[#212121]"
                : "border-gray-200 text-gray-700 hover:bg-gray-100",
            )}
          >
            <RefreshCw
              className={cn("w-4 h-4", refreshing && "animate-spin")}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Subscribers"
          value={stats.total}
          color="#E6501B"
          isDark={isDark}
        />
        <StatCard
          icon={MailCheck}
          label="Active"
          value={stats.active}
          color="#10B981"
          isDark={isDark}
        />
        <StatCard
          icon={MailX}
          label="Unsubscribed"
          value={stats.inactive}
          color="#EF4444"
          isDark={isDark}
        />
        <StatCard
          icon={TrendingUp}
          label="This Month"
          value={stats.thisMonth}
          color="#3B82F6"
          isDark={isDark}
        />
      </div>

      {/* Main Card */}
      <div className={cardClasses}>
        {/* Filters */}
        <div className={cn("p-4 border-b space-y-3", borderColor)}>
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  handleFiltersChange({ ...filters, search: e.target.value })
                }
                placeholder="Search by email or first name..."
                className={cn(
                  "w-full pl-9 pr-8 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition",
                  isDark
                    ? "bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400",
                )}
              />
              {filters.search && (
                <button
                  onClick={() =>
                    handleFiltersChange({ ...filters, search: "" })
                  }
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md",
                    isDark
                      ? "text-gray-400 hover:bg-[#2A2A2A]"
                      : "text-gray-400 hover:bg-gray-100",
                  )}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select
              value={filters.status}
              onChange={(e) =>
                handleFiltersChange({ ...filters, status: e.target.value })
              }
              className={cn(
                "lg:w-48 py-2 px-3 text-sm border rounded-lg focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition",
                isDark
                  ? "bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  : "bg-white border-gray-200 text-gray-900",
              )}
            >
              <option value="all">All Subscribers</option>
              <option value="active">Active Only</option>
              <option value="inactive">Unsubscribed Only</option>
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() =>
                handleFiltersChange({
                  search: "",
                  status: "all",
                  sortBy: "subscribed_at",
                  sortOrder: "desc",
                })
              }
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
            title="Unable to load subscribers."
            description={error}
            actionLabel="Try Again"
            onAction={() => fetchSubscribers()}
          />
        ) : loading ? (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={cn(
                      "border-b text-left text-xs font-semibold uppercase tracking-wide",
                      borderColor,
                      subText,
                    )}
                  >
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Subscribed</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <TableSkeleton rows={8} columns={6} />
              </table>
            </div>
            <div className="md:hidden p-4">
              <CardListSkeleton rows={5} />
            </div>
          </>
        ) : subscribers.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No subscribers yet"
            description={
              hasActiveFilters
                ? "Try adjusting your filters."
                : "Subscribers from the website and signup form will appear here."
            }
            actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
            onAction={
              hasActiveFilters
                ? () =>
                    handleFiltersChange({
                      search: "",
                      status: "all",
                      sortBy: "subscribed_at",
                      sortOrder: "desc",
                    })
                : undefined
            }
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={cn(
                      "border-b text-left text-xs font-semibold uppercase tracking-wide",
                      borderColor,
                      subText,
                    )}
                  >
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Subscribed</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id}
                      className={cn(
                        "border-b transition-colors",
                        borderColor,
                        isDark ? "hover:bg-[#212121]" : "hover:bg-gray-50",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div
                          className={cn(
                            "font-medium",
                            isDark ? "text-white" : "text-gray-900",
                          )}
                        >
                          {subscriber.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={isDark ? "text-gray-300" : "text-gray-700"}
                        >
                          {subscriber.first_name || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                            isDark
                              ? "bg-[#212121] text-gray-300"
                              : "bg-gray-100 text-gray-600",
                          )}
                        >
                          {subscriber.source || "website"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          isActive={subscriber.is_active}
                          isDark={isDark}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={isDark ? "text-gray-400" : "text-gray-500"}
                        >
                          {formatDate(subscriber.subscribed_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => setDeleteTarget(subscriber)}
                            aria-label={`Remove ${subscriber.email}`}
                            title="Remove"
                            className={cn(
                              "p-1.5 rounded-md transition-colors",
                              isDark
                                ? "text-gray-400 hover:bg-[#2A2A2A] hover:text-red-400"
                                : "text-gray-500 hover:bg-gray-100 hover:text-red-600",
                            )}
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

            {/* Mobile Cards */}
            <div className={cn("md:hidden divide-y", borderColor)}>
              {subscribers.map((subscriber) => (
                <div key={subscriber.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isDark ? "text-white" : "text-gray-900",
                        )}
                      >
                        {subscriber.email}
                      </p>
                      <p className={cn("text-xs truncate mt-0.5", subText)}>
                        {subscriber.first_name || "No name"} •{" "}
                        {subscriber.source || "website"}
                      </p>
                    </div>
                    <StatusBadge
                      isActive={subscriber.is_active}
                      isDark={isDark}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={cn("text-xs", subText)}>
                      {formatDate(subscriber.subscribed_at)}
                    </span>
                    <button
                      onClick={() => setDeleteTarget(subscriber)}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isDark
                          ? "text-gray-400 hover:bg-[#2A2A2A] hover:text-red-400"
                          : "text-gray-500 hover:bg-gray-100 hover:text-red-600",
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && !error && subscribers.length > 0 && (
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
            itemLabel="subscribers"
          />
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Remove ${deleteTarget?.email} from newsletter?`}
        description="This will remove the subscriber from the newsletter list. Their user account (if any) will NOT be affected. This action cannot be undone."
        confirmLabel="Remove"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteReason("");
        }}
        reason={deleteReason}
        onReasonChange={setDeleteReason}
        reasonPlaceholder="Optional: Reason for removal (spam, duplicate, GDPR, etc.)"
      />
    </div>
  );
};

export default Newsletter;
