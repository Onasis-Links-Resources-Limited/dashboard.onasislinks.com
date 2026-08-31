import { useTheme } from "../../context/ThemeContext";
import { FileText } from "lucide-react";

const RecentQuotes = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getStatusBadge = (status) => {
    const map = {
      pending: `bg-yellow-100 text-yellow-800 ${isDark ? "dark:bg-yellow-900/30 dark:text-yellow-400" : ""}`,
      approved: `bg-green-100 text-green-800 ${isDark ? "dark:bg-green-900/30 dark:text-green-400" : ""}`,
      rejected: `bg-red-100 text-red-800 ${isDark ? "dark:bg-red-900/30 dark:text-red-400" : ""}`,
      completed: `bg-[#C3110C]/10 text-[#C3110C] ${isDark ? "dark:bg-[#C3110C]/20" : ""}`,
      expired: `bg-gray-100 text-gray-700 ${isDark ? "dark:text-gray-400 dark:bg-gray-800" : ""}`,
      quoted: `bg-orange-100 text-orange-800 ${isDark ? "dark:bg-orange-900/30 dark:text-orange-300" : ""}`,
    };
    return map[status] || map.pending;
  };

  const getStatusDot = (status) => {
    const map = {
      pending: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
      completed: "bg-[#C3110C]",
      expired: "bg-gray-500",
      quoted: "bg-orange-500"
    };
    return map[status] || map.pending;
  };

  return (
    <div
      className={`rounded-xl border shadow-sm hover:border-[#C3110C] transition-all duration-300 overflow-hidden ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`}
    >
      {/* --- Header (No buttons) --- */}
      <div
        className={`flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}
      >
        <h3
          className={`text-sm sm:text-base font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}
        >
          <FileText size={16} className="text-[#C3110C]" /> Recent Quotes
        </h3>
      </div>

      {/* --- Table / Empty State --- */}
      {data && data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className={isDark ? "bg-[#0A0A0A]" : "bg-gray-50"}>
              <tr>
                <th
                  className={`px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  ID
                </th>
                <th
                  className={`px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Customer
                </th>
                <th
                  className={`hidden sm:table-cell px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Product
                </th>
                <th
                  className={`px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Date
                </th>
                <th
                  className={`px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold uppercase tracking-wider text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Status
                </th>
              </tr>
            </thead>

            <tbody
              className={`divide-y ${isDark ? "divide-[#2A2A2A]" : "divide-gray-200"}`}
            >
              {data.map((quote, idx) => (
                <tr
                  key={idx}
                  className={`transition ${
                    isDark ? "hover:bg-[#0A0A0A]" : "hover:bg-gray-50"
                  }`}
                >
                  <td
                    className={`px-3 sm:px-5 py-2.5 sm:py-3.5 font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {quote.quote_number}
                  </td>

                  <td
                    className={`px-3 sm:px-5 py-2.5 sm:py-3.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {quote.customer}
                  </td>

                  <td
                    className={`hidden sm:table-cell px-3 sm:px-5 py-2.5 sm:py-3.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {quote.product || "Bulk Request"}
                  </td>

                  <td
                    className={`px-3 sm:px-5 py-2.5 sm:py-3.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                  >
                    {new Date(quote.date).toLocaleDateString()}
                  </td>

                  <td className="px-3 sm:px-5 py-2.5 sm:py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusBadge(
                        quote.status,
                      )}`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${getStatusDot(
                          quote.status,
                        )}`}
                      ></span>

                      {quote.status.charAt(0).toUpperCase() +
                        quote.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* --- Empty State --- */
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
              isDark
                ? "bg-[#C3110C]/10 text-[#C3110C]"
                : "bg-[#C3110C]/10 text-[#C3110C]"
            }`}
          >
            <FileText size={26} strokeWidth={1.8} />
          </div>

          <h4
            className={`text-sm sm:text-base font-semibold mb-1 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            No Recent Quotes
          </h4>

          <p
            className={`text-xs sm:text-sm text-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            There are no recent quotes to display.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentQuotes;
