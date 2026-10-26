import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Plus, AlertCircle, Minus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const defaultValidUntil = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

const TERMS_OPTIONS = [
  "100% payment before delivery",
  "Full payment 15 days after delivery",
  "Ex work",
];

const UOM_OPTIONS = ["Unit", "PCS", "PAK", "M"];
const UOM_OTHER = "__other__";

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const QuoteProformaPanel = ({ open, quote, onGenerate, onCancel }) => {
  const { theme } = useTheme();

  const [prices, setPrices] = useState(() =>
    Object.fromEntries(
      (quote?.items || []).map((item) => [item.id, item.unitPrice || ""]),
    ),
  );

  // ✅ NEW: editable quantities per item
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(
      (quote?.items || []).map((item) => [item.id, item.quantity || 1]),
    ),
  );

  // ✅ NEW: UOM per item — value is the selected option, or "__other__"
  //    customUOM tracks the free-text value when "__other__" is selected.
  const [uoms, setUoms] = useState(() =>
    Object.fromEntries(
      (quote?.items || []).map((item) => {
        const initial = (item.unit || "").trim();
        const matched = UOM_OPTIONS.find(
          (u) => u.toLowerCase() === initial.toLowerCase(),
        );
        return [item.id, matched || (initial ? UOM_OTHER : "Unit")];
      }),
    ),
  );
  const [customUOMs, setCustomUOMs] = useState(() =>
    Object.fromEntries(
      (quote?.items || []).map((item) => {
        const initial = (item.unit || "").trim();
        const matched = UOM_OPTIONS.find(
          (u) => u.toLowerCase() === initial.toLowerCase(),
        );
        return [item.id, matched ? "" : initial];
      }),
    ),
  );

  const [discount, setDiscount] = useState(quote?.summary?.discount || 0);
  const [validUntil, setValidUntil] = useState(
    quote?.proforma?.validUntil || defaultValidUntil(),
  );
  const [error, setError] = useState(null);

  const [selectedTerms, setSelectedTerms] = useState(() => {
    if (!quote?.notes) return [];
    const notes = quote.notes;
    const possibleTerms = notes.split(/[,;]\s*|\n/).filter((t) => t.trim());
    const recognized = possibleTerms.filter((t) =>
      TERMS_OPTIONS.includes(t.trim()),
    );
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
    const filtered = customParts.filter(
      (t) => t.trim() !== "50% deposit required before order processing.",
    );
    return filtered.join(", ");
  });
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toEmails, setToEmails] = useState(quote?.customer?.email || "");
  const [ccEmails, setCcEmails] = useState("");
  const [bccEmails, setBccEmails] = useState("");

  const items = useMemo(() => quote?.items || [], [quote]);

  const { subtotal, taxAmount, total } = useMemo(() => {
    const st = round2(
      items.reduce(
        (sum, item) =>
          sum +
          (Number(prices[item.id]) || 0) *
            (Number(quantities[item.id]) || 0),
        0,
      ),
    );
    const tax = round2(st * 0.075);
    return {
      subtotal: st,
      taxAmount: tax,
      total: round2(st + tax - (Number(discount) || 0)),
    };
  }, [items, prices, quantities, discount]);

  if (!open || !quote) return null;

  const hasItems = items.length > 0;
  const allPriced =
    hasItems && items.every((item) => Number(prices[item.id]) > 0);
  const allQuantified =
    hasItems &&
    items.every((item) => Number(quantities[item.id]) > 0);
  const allUOMSet =
    hasItems &&
    items.every((item) => {
      const u = uoms[item.id];
      if (u === UOM_OTHER) return (customUOMs[item.id] || "").trim() !== "";
      return Boolean(u);
    });

  const today = todayISO();
  const validDateOK = validUntil && validUntil >= today;

  const buildNotes = () => {
    const parts = [];
    if (selectedTerms.length > 0) parts.push(...selectedTerms);
    if (customNotes.trim()) parts.push(customNotes.trim());
    return parts.join("\n");
  };

  const handleTermToggle = (term) => {
    setSelectedTerms((prev) =>
      prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term],
    );
  };

  const parseEmails = (value) =>
    value
      .split(/[;,\n]/)
      .map((email) => email.trim())
      .filter(Boolean);

  // ✅ Quantity helpers
  const setQty = (itemId, value) => {
    const n = Number.parseInt(value, 10);
    setQuantities((q) => ({
      ...q,
      [itemId]: Number.isFinite(n) && n > 0 ? n : 1,
    }));
  };
  const incQty = (itemId) => {
    setQuantities((q) => ({
      ...q,
      [itemId]: (Number(q[itemId]) || 0) + 1,
    }));
  };
  const decQty = (itemId) => {
    setQuantities((q) => ({
      ...q,
      [itemId]: Math.max(1, (Number(q[itemId]) || 1) - 1),
    }));
  };

  const handleSubmit = async (sendEmail) => {
    if (submitting) return;
    setError(null);

    if (!validDateOK) {
      setError("Valid Until must be today or a future date.");
      return;
    }
    if (!allUOMSet) {
      setError("Please specify a UOM for every item.");
      return;
    }

    setSubmitting(true);
    try {
      const notes = buildNotes();
      const to = parseEmails(toEmails);
      const cc = parseEmails(ccEmails);
      const bcc = parseEmails(bccEmails);
      if (
        sendEmail &&
        (!to.length ||
          to.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
          [...cc, ...bcc].some(
            (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
          ))
      ) {
        setError(
          "Enter valid recipient email addresses. Separate multiple addresses with commas.",
        );
        return;
      }

      await onGenerate({
        items: items.map((item) => ({
          id: item.id,
          unitPrice: Number(prices[item.id]) || 0,
          quantity: Number(quantities[item.id]) || 1,
          unit:
            uoms[item.id] === UOM_OTHER
              ? (customUOMs[item.id] || "").trim()
              : uoms[item.id],
        })),
        discount: Number(discount) || 0,
        validUntil,
        notes,
        sendEmail,
        send_email: sendEmail,
        to,
        cc,
        bcc,
        recipients: { to, cc, bcc },
      });
    } catch (err) {
      setError(err?.message || "Failed to generate proforma invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  const parseSpecifications = (specs) => {
    if (!specs) return null;
    if (typeof specs === "object") return specs;
    if (typeof specs === "string") {
      try {
        return JSON.parse(specs);
      } catch {
        return specs;
      }
    }
    return null;
  };

  const renderSpecifications = (specs) => {
    const parsed = parseSpecifications(specs);
    if (!parsed) return null;

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

    if (typeof parsed === "object") {
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
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
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
          {!hasItems && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  This quote has no items
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                  A proforma invoice can't be generated. Close this panel and
                  delete the quote instead.
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Assign a unit price, quantity, and UOM to each item. Choose whether
            to only generate the invoice or also email it to the recipients
            below.
          </p>

          <div className="border border-gray-200 dark:border-[#2A2A2A] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#1A1A1A] text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2 text-center w-32">Qty</th>
                  <th className="px-3 py-2 w-28">UOM</th>
                  <th className="px-3 py-2 w-28">Unit Price (₦)</th>
                  <th className="px-3 py-2 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const qty = Number(quantities[item.id]) || 1;
                  const uom = uoms[item.id];
                  const price = Number(prices[item.id]) || 0;

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-gray-100 dark:border-[#2A2A2A] align-top"
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

                      {/* ✅ Qty with ± controls */}
                      <td className="px-3 py-2">
                        <div className="inline-flex items-center rounded-md border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => decQty(item.id)}
                            disabled={qty <= 1}
                            aria-label="Decrease quantity"
                            className="px-2 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#212121] disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={qty}
                            onChange={(e) => setQty(item.id, e.target.value)}
                            aria-label={`Quantity for ${item.name}`}
                            className="w-14 text-center text-sm bg-transparent outline-none text-gray-900 dark:text-white [appearance:textfield]"
                          />
                          <button
                            type="button"
                            onClick={() => incQty(item.id)}
                            aria-label="Increase quantity"
                            className="px-2 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#212121]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* ✅ UOM selectable + custom */}
                      <td className="px-3 py-2">
                        <select
                          value={uom}
                          onChange={(e) =>
                            setUoms((u) => ({
                              ...u,
                              [item.id]: e.target.value,
                            }))
                          }
                          aria-label={`Unit of measure for ${item.name}`}
                          className="w-full border border-gray-200 dark:border-[#2A2A2A] rounded-md bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm px-2 py-1.5 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none"
                        >
                          {UOM_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                          <option value={UOM_OTHER}>Other…</option>
                        </select>
                        {uom === UOM_OTHER && (
                          <input
                            type="text"
                            value={customUOMs[item.id] || ""}
                            onChange={(e) =>
                              setCustomUOMs((c) => ({
                                ...c,
                                [item.id]: e.target.value,
                              }))
                            }
                            placeholder="Custom UOM"
                            aria-label={`Custom unit of measure for ${item.name}`}
                            className="mt-1 w-full border border-gray-200 dark:border-[#2A2A2A] rounded-md bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-xs px-2 py-1 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none"
                          />
                        )}
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
                        {formatMoney(price * qty)}
                      </td>
                    </tr>
                  );
                })}
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
                min={today}
                onChange={(e) => setValidUntil(e.target.value)}
                className={`w-full border rounded-md bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm px-2.5 py-1.5 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none ${
                  !validDateOK
                    ? "border-red-400 dark:border-red-600"
                    : "border-gray-200 dark:border-[#2A2A2A]"
                }`}
              />
              {!validDateOK && (
                <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">
                  Must be today or later.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
              Email Recipients
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 sm:col-span-2">
                To{" "}
                <span className="font-normal text-gray-400">
                  (multiple addresses separated by commas)
                </span>
                <input
                  type="text"
                  value={toEmails}
                  onChange={(event) => setToEmails(event.target.value)}
                  placeholder="client@example.com, accounts@example.com"
                  className="mt-1 w-full border border-gray-200 dark:border-[#2A2A2A] rounded-md bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm px-2.5 py-1.5 focus:ring-2 focus:ring-[#C3110C] outline-none"
                />
              </label>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                CC
                <input
                  type="text"
                  value={ccEmails}
                  onChange={(event) => setCcEmails(event.target.value)}
                  placeholder="colleague@example.com"
                  className="mt-1 w-full border border-gray-200 dark:border-[#2A2A2A] rounded-md bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm px-2.5 py-1.5 focus:ring-2 focus:ring-[#C3110C] outline-none"
                />
              </label>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                BCC
                <input
                  type="text"
                  value={bccEmails}
                  onChange={(event) => setBccEmails(event.target.value)}
                  placeholder="archive@example.com"
                  className="mt-1 w-full border border-gray-200 dark:border-[#2A2A2A] rounded-md bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm px-2.5 py-1.5 focus:ring-2 focus:ring-[#C3110C] outline-none"
                />
              </label>
            </div>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              Recipient fields are used only when you choose Generate &amp;
              Send.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Terms &amp; Notes
            </label>

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

            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-xs text-[#C3110C] dark:text-[#E6501B] hover:underline flex items-center gap-1 mb-2"
            >
              {showCustomInput ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3"/>}
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

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

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

          {hasItems && (!allPriced || !allQuantified) && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Every item needs a unit price greater than ₦0 and a quantity of at
              least 1 before the Proforma Invoice can be generated.
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
            onClick={() => handleSubmit(false)}
            disabled={
              submitting ||
              !allPriced ||
              !hasItems ||
              !allQuantified ||
              !allUOMSet ||
              !validDateOK
            }
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#212121] transition-colors disabled:opacity-50"
          >
            {submitting && (
              <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-[#C3110C] rounded-full animate-spin" />
            )}
            Generate Only
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={
              submitting ||
              !allPriced ||
              !hasItems ||
              !allQuantified ||
              !allUOMSet ||
              !validDateOK
            }
            type="button"
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