import { Download, RefreshCw, Trash2, Plus } from "lucide-react";
import { cn } from "../../libs/utils";

/**
 * Header action bar for the Quotes list page. Allows admins to create new
 * quotes for email-based requests and manage existing quotes.
 */
const QuoteToolbar = ({
  onAddQuote,
  onExport,
  onRefresh,
  onBulkDelete,
  selectedCount = 0,
  refreshing = false,
  exporting = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onAddQuote}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Quote
      </button>
      <button
        onClick={onExport}
        disabled={exporting}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        <Download className={cn("w-4 h-4", exporting && "animate-bounce")} />
        {exporting ? "Exporting…" : "Export CSV"}
      </button>

      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
        Refresh
      </button>

      <button
        onClick={onBulkDelete}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
          selectedCount > 0
            ? "border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800",
        )}
      >
        <Trash2 className="w-4 h-4" />
        Bulk Delete
        {selectedCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold">
            {selectedCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default QuoteToolbar;
