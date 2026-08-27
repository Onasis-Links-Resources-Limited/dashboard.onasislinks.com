import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, FileText } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { formatMoney } from "./ProformaUtils";

const defaultValidUntil = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Lets staff assign unit prices to a client's requested items (which arrive
 * unpriced from the website) and generates + sends the Proforma Invoice.
 * Live-calculates subtotal/VAT/total from numeric state only — never from
 * formatted strings — to avoid floating point display errors.
 */
const QuoteProformaPanel = ({ open, quote, onGenerate, onCancel }) => {
  const { theme } = useTheme();
  const [prices, setPrices] = useState(() =>
    Object.fromEntries(
      (quote?.items || []).map((item) => [item.id, item.unitPrice || ""]),
    ),
  );
  const [discount, setDiscount] = useState(quote?.summary?.discount || 0);
  const [validUntil, setValidUntil] = useState(
    quote?.proforma?.validUntil || defaultValidUntil(),
  );
  const [submitting, setSubmitting] = useState(false);

  const items = useMemo(() => quote?.items || [], [quote]);

  const { subtotal, taxAmount, total } = useMemo(() => {
    const st = round2(
      items.reduce(
        (sum, item) => sum + (Number(prices[item.id]) || 0) * item.quantity,
        0,
      ),
    );
    const tax = round2(st * 0.075);
    return {
      subtotal: st,
      taxAmount: tax,
      total: round2(st + tax - (Number(discount) || 0)),
    };
  }, [items, prices, discount]);

  if (!open || !quote) return null;

  const allPriced = items.every((item) => Number(prices[item.id]) > 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onGenerate({
        items: items.map((item) => ({
          id: item.id,
          unitPrice: Number(prices[item.id]) || 0,
        })),
        discount: Number(discount) || 0,
        validUntil,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/50 ${theme === "dark" ? "dark" : ""}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C3110C]/10 dark:bg-[#E6501B]/10 text-[#C3110C] dark:text-[#E6501B] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Generate Proforma Invoice
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Quote {quote.id} · {quote.customer.name}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={submitting}
            aria-label="Close"
            className="p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Assign a unit price to each requested item. These prices will appear
            on the Proforma Invoice sent to the customer.
          </p>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 w-32">Unit Price (₦)</th>
                  <th className="px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      {item.specifications && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.specifications}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={prices[item.id]}
                        onChange={(e) =>
                          setPrices((p) => ({
                            ...p,
                            [item.id]: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        aria-label={`Unit price for ${item.name}`}
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm px-2 py-1.5 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {formatMoney(
                        (Number(prices[item.id]) || 0) * item.quantity,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Discount (₦)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm px-2.5 py-1.5 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm px-2.5 py-1.5 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>VAT (7.5%)</span>
              <span>{formatMoney(taxAmount)}</span>
            </div>
            {Number(discount) > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Discount</span>
                <span>-{formatMoney(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-1.5 mt-1.5 border-t border-gray-200 dark:border-gray-700">
              <span>Total</span>
              <span className="text-[#C3110C] dark:text-[#E6501B]">
                {formatMoney(total)}
              </span>
            </div>
          </div>

          {!allPriced && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Every item needs a unit price greater than ₦0 before the Proforma
              Invoice can be sent.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !allPriced}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] transition-colors disabled:opacity-50"
          >
            {submitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Generate &amp; Send Proforma Invoice
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default QuoteProformaPanel;
