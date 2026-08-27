/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import quoteAPI from "../../api/quoteAPI";
import { useToast } from "../../context/ToastContext";
import QuoteToolbar from "../../components/quotes/QuoteToolbar";
import QuoteFilters, {
  DEFAULT_FILTERS,
} from "../../components/quotes/QuoteFilters";
import QuoteTable from "../../components/quotes/QuoteTable";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AddQuoteDialog from "../../components/quotes/AddQuoteDialog";
import { useTheme } from "../../context/ThemeContext";

const downloadCSV = (csvText, filename) => {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

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
  const [addQuoteDialogOpen, setAddQuoteDialogOpen] = useState(false);

  const requestIdRef = useRef(0);

  const fetchQuotes = useCallback(
    async ({ isRefresh = false } = {}) => {
      const requestId = ++requestIdRef.current;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      try {
        const result = await quoteAPI.getAll({ ...filters, page, limit });
        if (requestId !== requestIdRef.current) return; // stale response, ignore
        setQuotes(result.data);
        setMeta(result.meta);
        setSelectedIds((prev) =>
          prev.filter((id) => result.data.some((q) => q.id === id)),
        );
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError("Something went wrong while fetching quotes.");
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
      const csv = await quoteAPI.exportCSV(filters);
      downloadCSV(
        csv,
        `quotes-export-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      toast.success("Quotes exported successfully.");
    } catch {
      toast.error("Failed to export quotes.");
    } finally {
      setExporting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const allOnPageSelected =
      quotes.length > 0 && quotes.every((q) => selectedIds.includes(q.id));
    if (allOnPageSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !quotes.some((q) => q.id === id)),
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

  const handleQuoteCreated = (newQuote) => {
    setAddQuoteDialogOpen(false);
    toast.success(`Quote ${newQuote.id} created successfully!`);
    // Refresh the list
    fetchQuotes({ isRefresh: true });
    // Navigate to the new quote detail page
    setTimeout(() => {
      navigate(`/dashboard/quotes/${newQuote.id}`);
    }, 500);
  };

  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await quoteAPI.bulkDelete(selectedIds);
      toast.success(
        `${selectedIds.length} quote${selectedIds.length > 1 ? "s" : ""} deleted successfully.`,
      );
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      fetchQuotes({ isRefresh: true });
    } catch {
      toast.error("Failed to delete quotes.");
    } finally {
      setBulkDeleting(false);
    }
  };

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
      <div className={` ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"} rounded-xl overflow-hidden`}>
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

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Delete ${selectedIds.length} quote${selectedIds.length > 1 ? "s" : ""}?`}
        description="This will permanently remove the selected quotes. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
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
