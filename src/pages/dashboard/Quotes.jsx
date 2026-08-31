/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import QuoteToolbar from "../../components/quotes/QuoteToolbar";
import QuoteFilters, { DEFAULT_FILTERS } from "../../components/quotes/QuoteFilters";
import QuoteTable from "../../components/quotes/QuoteTable";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AddQuoteDialog from "../../components/quotes/AddQuoteDialog";
import { cn } from "../../libs/utils";

const hasActiveFilters = (filters) =>
  filters.search !== "" ||
  filters.status !== "all" ||
  filters.dateFrom !== "" ||
  filters.dateTo !== "";

const Quotes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const token = localStorage.getItem("token");

  const [quotes, setQuotes] = useState([]);
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
  const [bulkReason, setBulkReason] = useState("");
  const [addQuoteDialogOpen, setAddQuoteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  const requestIdRef = useRef(0);

  const fetchQuotes = useCallback(
    async ({ isRefresh = false } = {}) => {
      const requestId = ++requestIdRef.current;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      try {
        const result = await api.quotes.getAll(token, { ...filters, page, limit });
        if (requestId !== requestIdRef.current) return;
        
        // Handle different response structures
        const data = result.data || [];
        const metaData = result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };
        
        setQuotes(data);
        setMeta(metaData);
        setSelectedIds((prev) =>
          prev.filter((id) => data.some((q) => q.id === id))
        );
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err.response?.data?.message || "Something went wrong while fetching quotes.");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [filters, page, limit, token]
  );

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, limit]);

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleRefresh = () => {
    if (refreshing || loading) return;
    fetchQuotes({ isRefresh: true });
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const blob = await api.quotes.export(token, filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `quotes-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Quotes exported successfully.");
    } catch {
      toast.error("Failed to export quotes.");
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
    const allOnPageSelected =
      quotes.length > 0 && quotes.every((q) => selectedIds.includes(q.id));
    if (allOnPageSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !quotes.some((q) => q.id === id))
      );
    } else {
      setSelectedIds((prev) => [
        ...new Set([...prev, ...quotes.map((q) => q.id)]),
      ]);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) {
      toast.warning("Select at least one quote to delete.");
      return;
    }
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await api.quotes.bulkDelete(token, selectedIds);
      toast.success(
        `${selectedIds.length} quote${selectedIds.length > 1 ? "s" : ""} deleted successfully.`
      );
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      setBulkReason("");
      fetchQuotes({ isRefresh: true });
    } catch {
      toast.error("Failed to delete quotes.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const confirmDeleteQuote = async () => {
    setDeleting(true);
    try {
      await api.quotes.delete(token, deleteTarget.id);
      toast.success(`Quote ${deleteTarget.quoteNumber || deleteTarget.id} deleted successfully.`);
      setDeleteTarget(null);
      setDeleteReason("");
      fetchQuotes({ isRefresh: true });
    } catch {
      toast.error("Failed to delete quote.");
    } finally {
      setDeleting(false);
    }
  };

  const handleQuoteCreated = (newQuote) => {
    setAddQuoteDialogOpen(false);
    toast.success(`Quote ${newQuote.quoteNumber || newQuote.id} created successfully!`);
    fetchQuotes({ isRefresh: true });
    setTimeout(() => {
      navigate(`/dashboard/quotes/${newQuote.id}`);
    }, 500);
  };

  const cardClasses = cn(
    "border rounded-xl overflow-hidden",
    isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Quotes Management
          </h1>
          <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Track, review and act on customer quote requests.
          </p>
        </div>
        <QuoteToolbar
          onAddQuote={() => setAddQuoteDialogOpen(true)}
          onExport={handleExport}
          onRefresh={handleRefresh}
          onBulkDelete={handleBulkDeleteClick}
          selectedCount={selectedIds.length}
          refreshing={refreshing}
          exporting={exporting}
        />
      </div>

      {/* Card containing filters + table + pagination */}
      <div className={cardClasses}>
        <QuoteFilters filters={filters} onChange={handleFiltersChange} />

        <QuoteTable
          quotes={quotes}
          loading={loading}
          error={error}
          onRetry={() => fetchQuotes()}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onView={(quote) => navigate(`/dashboard/quotes/${quote.id}`)}
          onDelete={setDeleteTarget}
          hasActiveFilters={hasActiveFilters(filters)}
          onClearFilters={() => handleFiltersChange(DEFAULT_FILTERS)}
        />

        {!loading && !error && quotes.length > 0 && (
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
            itemLabel="quotes"
          />
        )}
      </div>

      {/* Delete Single Quote Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete Quote ${deleteTarget?.quoteNumber || deleteTarget?.id}?`}
        description="This will permanently remove this quote. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDeleteQuote}
        onCancel={() => { setDeleteTarget(null); setDeleteReason(""); }}
        reason={deleteReason}
        onReasonChange={setDeleteReason}
        reasonPlaceholder="Optional: Reason for deletion..."
      />

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Delete ${selectedIds.length} quote${selectedIds.length > 1 ? "s" : ""}?`}
        description="This will permanently remove the selected quotes. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => { setBulkDeleteOpen(false); setBulkReason(""); }}
        reason={bulkReason}
        onReasonChange={setBulkReason}
        reasonPlaceholder="Optional: Reason for bulk deletion..."
        showReason={true}
      />

      <AddQuoteDialog
        open={addQuoteDialogOpen}
        onClose={() => setAddQuoteDialogOpen(false)}
        onQuoteCreated={handleQuoteCreated}
      />
    </div>
  );
};

export default Quotes;