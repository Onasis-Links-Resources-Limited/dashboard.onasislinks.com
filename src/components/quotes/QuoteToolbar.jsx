import { useState } from "react";
import {
  Download,
  RefreshCw,
  Trash2,
  Plus,
  ChevronDown,
  ClipboardList,
} from "lucide-react";
import { cn } from "../../libs/utils";
import { useTheme } from "../../context/ThemeContext";

/**
 * Header action bar for the Quotes list page. Allows admins to create new
 * quotes for email-based requests and manage existing quotes.
 */
const QuoteToolbar = ({
  onAddQuote,
  onRecordPO,
  onExport,
  onRefresh,
  onBulkDelete,
  selectedCount = 0,
  refreshing = false,
  exporting = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setCreateMenuOpen((open) => !open)}
          aria-expanded={createMenuOpen}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add to Quote
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${createMenuOpen ? "rotate-180" : ""}`}
          />
        </button>
        {createMenuOpen && (
          <div className="absolute left-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-[#2A2A2A] dark:bg-[#1A1A1A]">
            <button
              onClick={() => {
                setCreateMenuOpen(false);
                onAddQuote?.();
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#212121]"
            >
              <Plus className="h-4 w-4 text-blue-600" /> Add Quote
            </button>
            <button
              onClick={() => {
                setCreateMenuOpen(false);
                onRecordPO?.();
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#212121]"
            >
              <ClipboardList className="h-4 w-4 text-[#C3110C]" /> Record PO
              Number
            </button>
          </div>
        )}
      </div>
      <button
        onClick={onExport}
        disabled={exporting}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${isDark ? "border-[#2A2A2A] text-gray-300 hover:bg-[#212121]" : "border-gray-200 text-gray-700 hover:bg-gray-100"} transition-colors disabled:opacity-50 cursor-pointer`}
      >
        <Download className={cn("w-4 h-4", exporting && "animate-bounce")} />
        {exporting ? "Exporting…" : "Export CSV"}
      </button>

      <button
        onClick={onRefresh}
        disabled={refreshing}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${isDark ? "border-[#2A2A2A] text-gray-300 hover:bg-[#212121]" : "border-gray-200 text-gray-700 hover:bg-gray-100"} transition-colors disabled:opacity-50 cursor-pointer`}
      >
        <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
        Refresh
      </button>

      <button
        onClick={onBulkDelete}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
          selectedCount > 0
            ? "border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
            : `border-gray-200 ${isDark ? "border-[#2A2A2A] text-gray-500 hover:bg-[#212121]" : "border-gray-200 text-gray-400 hover:bg-gray-100"} cursor-not-allowed`,
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
