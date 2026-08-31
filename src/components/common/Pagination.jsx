const Pagination = ({
  page = 1,
  totalPages = 1,
  onPageChange = () => {},
  limit = 10,
  onLimitChange = () => {},
  itemLabel = "items",
}) => {
  const buildPageButtons = () => {
    const pages = [];
    const addPage = (pageNumber) => pages.push(pageNumber);

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) {
        addPage(i);
      }
      return pages;
    }

    addPage(1);

    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);

    if (left > 2) {
      addPage("left-ellipsis");
    }

    for (let i = left; i <= right; i += 1) {
      addPage(i);
    }

    if (right < totalPages - 1) {
      addPage("right-ellipsis");
    }

    addPage(totalPages);
    return pages;
  };

  const pageButtons = buildPageButtons();

  return (
    <div className="flex flex-col gap-3 p-4 border-t border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#212121] sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-gray-600 dark:text-gray-300">
        Showing page {page} of {totalPages} · {itemLabel}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border border-gray-300 dark:border-[#2A2A2A] rounded px-2 py-1 text-sm bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-200"
          aria-label="Results per page"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </select>

        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="px-3 py-1 border rounded text-sm bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-200 border-gray-300 dark:border-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          First
        </button>

        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded text-sm bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-200 border-gray-300 dark:border-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        {pageButtons.map((pageNumber) =>
          typeof pageNumber === "string" ? (
            <span
              key={pageNumber}
              className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              disabled={pageNumber === page}
              className={`px-3 py-1 border rounded text-sm ${
                pageNumber === page
                  ? "bg-[#C3110C] text-white border-[#C3110C]"
                  : "bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-200 border-gray-300 dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-gray-800"
              } disabled:opacity-50`}
            >
              {pageNumber}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded text-sm bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-200 border-gray-300 dark:border-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded text-sm bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-200 border-gray-300 dark:border-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Last
        </button>
      </div>
    </div>
  );
};

export default Pagination;
