import { formatCurrency } from "../../utils/format";

/** Line items for a quote. Table layout on desktop/tablet, cards on mobile. */
const QuoteItemsList = ({ items = [] }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Items
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No items on this quote.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white p-5 pb-0">
        Items
      </h2>

      {/* Desktop / tablet table */}
      <div className="hidden md:block mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">SKU</th>
              <th className="px-5 py-3">Qty</th>
              <th className="px-5 py-3">Unit Price</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </div>
                  {item.specifications && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.specifications}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                  {item.sku}
                </td>
                <td className="px-5 py-3 text-gray-700 dark:text-gray-300">
                  {item.quantity}
                </td>
                <td className="px-5 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {item.unitPrice > 0 ? (
                    formatCurrency(item.unitPrice)
                  ) : (
                    <span className="text-xs italic text-gray-400 dark:text-gray-500">
                      Not yet priced
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {item.unitPrice > 0 ? (
                    formatCurrency(item.total)
                  ) : (
                    <span className="text-xs italic text-gray-400 dark:text-gray-500">
                      —
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800 mt-3">
        {items.map((item) => (
          <div key={item.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {item.name}
                </p>
                <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  SKU: {item.sku}
                </p>
                {item.specifications && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.specifications}
                  </p>
                )}
              </div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm whitespace-nowrap">
                {item.unitPrice > 0 ? (
                  formatCurrency(item.total)
                ) : (
                  <span className="text-xs italic text-gray-400 dark:text-gray-500 font-normal">
                    Not yet priced
                  </span>
                )}
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Qty {item.quantity} × {formatCurrency(item.unitPrice)}
            </p>
          </div>
        ))}
      </div>
      <div className="h-2 md:hidden" />
    </div>
  );
};

export default QuoteItemsList;
