import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { formatMoney } from "./proformaUtils";

const defaultValidUntil = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

// Hardcoded standard terms staff can pick from
const TERMS_OPTIONS = [
  "100% payment before delivery",
  "Full payment 15 days after delivery",
  "Ex work",
];

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

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

  // Support multiple terms - store as array
  const [selectedTerms, setSelectedTerms] = useState(() => {
    if (!quote?.notes) return [];
    const notes = quote.notes;
    const possibleTerms = notes.split(/[,;]\s*|\n/).filter((t) => t.trim());
    const recognized = possibleTerms.filter((t) =>
      TERMS_OPTIONS.includes(t.trim()),
    );
    // Filter out any default deposit note
    const filtered = recognized.filter(
      (t) => t !== "50% deposit required before order processing.",
    );
    return filtered.map((t) => t.trim());
  });
  const [customNotes, setCustomNotes] = useState(() => {
    if (!quote?.notes) return "";
    const notes = quote.notes;
    const possibleTerms = notes.split(/[,;]\s*|\n/).filter((t) => t.trim());
    const customParts = possibleTerms.filter(
      (t) => !TERMS_OPTIONS.includes(t.trim()),
    );
    // Filter out any default deposit note from custom notes too
    const filtered = customParts.filter(
      (t) => t.trim() !== "50% deposit required before order processing.",
    );
    return filtered.join(", ");
  });
  const [showCustomInput, setShowCustomInput] = useState(false);
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

  const buildNotes = () => {
    const parts = [];
    if (selectedTerms.length > 0) {
      parts.push(...selectedTerms);
    }
    if (customNotes.trim()) {
      parts.push(customNotes.trim());
    }
    return parts.join("\n");
  };

  const handleTermToggle = (term) => {
    setSelectedTerms((prev) => {
      if (prev.includes(term)) {
        return prev.filter((t) => t !== term);
      } else {
        return [...prev, term];
      }
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Only send notes that were explicitly selected or entered
      const notes = buildNotes();
      await onGenerate({
        items: items.map((item) => ({
          id: item.id,
          unitPrice: Number(prices[item.id]) || 0,
        })),
        discount: Number(discount) || 0,
        validUntil,
        notes: notes, // This will be empty if nothing is selected
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  return createPortal(
    <div
      className={`fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/50 ${theme === "dark" ? "dark" : ""}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#C3110C]/10 dark:bg-[#E6501B]/10 text-[#C3110C] dark:text-[#E6501B] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Generate Proforma Invoice
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Quote {quote.quoteNumber} · {quote.customer.name}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={submitting}
            aria-label="Close"
            className="p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-[#212121] disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Assign a unit price to each requested item. These prices will appear
            on the Proforma Invoice sent to the customer.
          </p>

          <div className="border border-gray-200 dark:border-[#2A2A2A] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
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
                    className="border-t border-gray-100 dark:border-[#2A2A2A]"
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      {item.specifications && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {renderSpecifications(item.specifications)}
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
                        className="w-full border border-gray-200 dark:border-[#2A2A2A] rounded-md bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm px-2 py-1.5 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none"
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
                className="w-full border border-gray-200 dark:border-[#2A2A2A] rounded-md bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm px-2.5 py-1.5 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none"
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
                className="w-full border border-gray-200 dark:border-[#2A2A2A] rounded-md bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm px-2.5 py-1.5 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Terms &amp; Notes
            </label>

            {/* Terms checkboxes */}
            <div className="space-y-1.5 mb-2">
              {TERMS_OPTIONS.map((term) => (
                <label
                  key={term}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTerms.includes(term)}
                    onChange={() => handleTermToggle(term)}
                    className="w-4 h-4 rounded border-gray-300 text-[#C3110C] focus:ring-[#C3110C]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {term}
                  </span>
                </label>
              ))}
            </div>

            {/* Custom notes toggle */}
            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs text-[#C3110C] dark:text-[#E6501B] hover:underline flex items-center gap-1 mb-2"
            >
              <Plus className="w-3 h-3" />
              {showCustomInput ? "Hide custom notes" : "Add custom notes"}
            </button>

            {showCustomInput && (
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Enter custom terms and notes that apply to this proforma invoice…"
                rows={3}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm px-2.5 py-2 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none resize-y"
              />
            )}
          </div>

          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4 space-y-1.5 text-sm">
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
            <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-1.5 mt-1.5 border-t border-gray-200 dark:border-[#2A2A2A]">
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

        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 dark:bg-[#1A1A1A] border-t border-gray-100 dark:border-[#2A2A2A]">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#1A1A1A] dark:hover:bg-[#212121] transition-colors disabled:opacity-50"
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
