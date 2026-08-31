import { formatCurrency } from "../../utils/format";

/** Line items for a quote. Table layout on desktop/tablet, cards on mobile. */
const QuoteItemsList = ({ items = [] }) => {
  // Helper function to parse specifications
  const parseSpecifications = (specs) => {
    if (!specs) return null;
    
    // If it's already an object or array, return it
    if (typeof specs === 'object') return specs;
    
    // If it's a string, try to parse it as JSON
    if (typeof specs === 'string') {
      try {
        const parsed = JSON.parse(specs);
        return parsed;
      } catch {
        // If parsing fails, return as plain text
        return specs;
      }
    }
    
    return null;
  };

  // Helper to render specifications
  const renderSpecifications = (specs) => {
    const parsed = parseSpecifications(specs);
    
    if (!parsed) return null;
    
    // If it's an array, render each item
    if (Array.isArray(parsed)) {
      return (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 space-y-0.5">
          {parsed.map((item, index) => (
            <div key={index} className="flex gap-2">
              <span className="font-medium capitalize">{item.key}:</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // If it's an object (not array), render key-value pairs
    if (typeof parsed === 'object') {
      return (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 space-y-0.5">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="font-medium capitalize">{key}:</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // If it's a string, display it directly
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {String(parsed)}
      </div>
    );
  };

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-5">
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
    <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl overflow-hidden">
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
                  {/* Render specifications */}
                  {renderSpecifications(item.specifications)}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                  {item.sku || "—"}
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
                  SKU: {item.sku || "—"}
                </p>
                {/* Render specifications for mobile */}
                {(() => {
                  const rendered = renderSpecifications(item.specifications);
                  return rendered ? (
                    <div className="mt-0.5">{rendered}</div>
                  ) : null;
                })()}
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
              Qty {item.quantity} × {item.unitPrice > 0 ? formatCurrency(item.unitPrice) : "—"}
            </p>
          </div>
        ))}
      </div>
      <div className="h-2 md:hidden" />
    </div>
  );
};

export default QuoteItemsList;