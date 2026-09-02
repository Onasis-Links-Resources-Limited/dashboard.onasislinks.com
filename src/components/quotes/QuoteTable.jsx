import { Eye, FileDown, AlertCircle } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import EmptyState from "../common/EmptyState";
import { TableSkeleton, CardListSkeleton } from "../common/Skeleton.jsx";
import { formatCurrency } from "../../utils/format";
import { formatDate } from "../../libs/utils";
import { downloadProformaPDF } from "./proformaUtils.js";
import { useToast } from "../../context/ToastContext";

const COLUMN_COUNT = 8;

const QuoteRowActions = ({ quote, onView }) => {
  const { toast } = useToast();

  const handleQuickDownload = async (e) => {
    e.stopPropagation();
    try {
      await downloadProformaPDF(quote);
      toast.success("Proforma Invoice downloaded as PDF.");
    } catch {
      toast.error("Failed to generate PDF.");
    }
  };

  return (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={() => onView(quote)}
        aria-label={`View quote ${quote.id}`}
        title="View"
        className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#C3110C] dark:hover:text-[#E6501B] transition-colors"
      >
        <Eye className="w-4 h-4" />
      </button>
      {quote.proforma && (
        <button
          onClick={handleQuickDownload}
          aria-label={`Download proforma invoice for ${quote.id}`}
          title="Download Proforma Invoice (PDF)"
          className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#C3110C] dark:hover:text-[#E6501B] transition-colors"
        >
          <FileDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/**
 * Desktop table (>=768px) with selectable rows, and a stacked card list on
 * mobile so nothing forces horizontal scrolling on small screens.
 */
const QuoteTable = ({
  quotes,
  loading,
  error,
  onRetry,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  hasActiveFilters,
  onClearFilters,
}) => {
  const allSelected =
    quotes.length > 0 && quotes.every((q) => selectedIds.includes(q.id));

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Unable to load quotes."
        description={error}
        actionLabel="Try Again"
        onAction={onRetry}
      />
    );
  }

  if (loading) {
    return (
      <>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <TableHead
              allSelected={false}
              onToggleSelectAll={() => {}}
              disabled
            />
            <TableSkeleton rows={8} columns={COLUMN_COUNT} />
          </table>
        </div>
        <div className="md:hidden p-4">
          <CardListSkeleton rows={5} />
        </div>
      </>
    );
  }

  if (quotes.length === 0) {
    return (
      <EmptyState
        title="No quotes found"
        description={
          hasActiveFilters
            ? "Try adjusting your search or filters."
            : "No quotes have been created yet."
        }
        actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
        onAction={hasActiveFilters ? onClearFilters : undefined}
      />
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <TableHead
            allSelected={allSelected}
            onToggleSelectAll={onToggleSelectAll}
          />
          <tbody>
            {quotes.map((quote) => (
              <tr
                key={quote.id}
                className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#212121] transition-colors"
              >
                <td className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(quote.id)}
                    onChange={() => onToggleSelect(quote.id)}
                    aria-label={`Select quote ${quote.id}`}
                    className="rounded border-gray-300 dark:border-[#2A2A2A] text-[#C3110C] focus:ring-[#C3110C]"
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onView(quote)}
                    className="font-mono text-xs font-medium text-[#C3110C] dark:text-[#E6501B] hover:underline"
                  >
                    {quote.quoteNumber}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-900 dark:text-white font-medium">
                    {quote.customer.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {quote.customer.email}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {quote.items.length}{" "}
                  {quote.items.length === 1 ? "item" : "items"}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {formatCurrency(quote.summary.totalAmount)}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {formatDate(quote.date)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={quote.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <QuoteRowActions quote={quote} onView={onView} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {quotes.map((quote) => (
          <div key={quote.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(quote.id)}
                  onChange={() => onToggleSelect(quote.id)}
                  aria-label={`Select quote ${quote.id}`}
                  className="mt-1 rounded border-gray-300 dark:border-gray-600 text-[#C3110C] focus:ring-[#C3110C] flex-shrink-0"
                />
                <div className="min-w-0">
                  <button
                    onClick={() => onView(quote)}
                    className="font-mono text-xs font-medium text-[#C3110C] dark:text-[#E6501B]"
                  >
                    {quote.quoteNumber}
                  </button>
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">
                    {quote.customer.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {quote.customer.email}
                  </div>
                </div>
              </div>
              <StatusBadge status={quote.status} size="sm" />
            </div>

            <div className="flex items-center justify-between mt-3 text-sm">
              <div className="text-gray-500 dark:text-gray-400">
                {quote.items.length}{" "}
                {quote.items.length === 1 ? "item" : "items"} ·{" "}
                {formatDate(quote.date)}
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(quote.summary.totalAmount)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1 mt-2 -mr-1.5">
              <QuoteRowActions quote={quote} onView={onView} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

const TableHead = ({ allSelected, onToggleSelectAll, disabled = false }) => (
  <thead>
    <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
      <th className="px-4 py-3 w-10">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleSelectAll}
          disabled={disabled}
          aria-label="Select all quotes"
          className="rounded border-gray-300 dark:border-gray-600 text-[#C3110C] focus:ring-[#C3110C]"
        />
      </th>
      <th className="px-4 py-3">Quote Number</th>
      <th className="px-4 py-3">Customer</th>
      <th className="px-4 py-3">Items</th>
      <th className="px-4 py-3">Amount</th>
      <th className="px-4 py-3">Date</th>
      <th className="px-4 py-3">Status</th>
      <th className="px-4 py-3 text-right">Actions</th>
    </tr>
  </thead>
);

export default QuoteTable;
