import { Search, X, ArrowUpDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "quoted", label: "Quoted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
];

const SORT_OPTIONS = [
  { value: "date", label: "Date" },
  { value: "customer", label: "Customer" },
  { value: "amount", label: "Amount" },
];

const inputClasses =
  "w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 py-2 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition";

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  dateFrom: "",
  dateTo: "",
  sortBy: "date",
  sortOrder: "desc",
};

const isActive = (filters) =>
  filters.search !== "" ||
  filters.status !== "all" ||
  filters.dateFrom !== "" ||
  filters.dateTo !== "";

/**
 * Search + status + date range + sort controls for the quotes list.
 * Fully controlled — the parent owns filter state and re-queries the API.
 */
const QuoteFilters = ({ filters, onChange }) => {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Search by Customer/ID..."
            aria-label="Search quotes"
            className={`pl-9 pr-8 ${inputClasses}`}
          />
          {filters.search && (
            <button
              onClick={() => set({ search: "" })}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => set({ status: e.target.value })}
          aria-label="Filter by status"
          className={`lg:w-40 ${inputClasses}`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => set({ dateFrom: e.target.value })}
            aria-label="Date from"
            className={`lg:w-36 ${inputClasses}`}
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => set({ dateTo: e.target.value })}
            aria-label="Date to"
            className={`lg:w-36 ${inputClasses}`}
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => set({ sortBy: e.target.value })}
            aria-label="Sort by"
            className={`lg:w-32 ${inputClasses}`}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              set({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })
            }
            aria-label={`Sort order: ${filters.sortOrder === "asc" ? "ascending" : "descending"}`}
            title={filters.sortOrder === "asc" ? "Ascending" : "Descending"}
            className="flex items-center justify-center p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            <ArrowUpDown
              className={`w-4 h-4 transition-transform ${filters.sortOrder === "asc" ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {isActive(filters) && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="text-xs font-medium text-[#C3110C] dark:text-[#E6501B] hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default QuoteFilters;
