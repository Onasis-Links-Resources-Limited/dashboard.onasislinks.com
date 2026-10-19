import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Loader2, Plus, Trash2, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

const inputClass =
  "w-full rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#C3110C]";

const money = (value) =>
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const RecordPONumberDialog = ({ open, onClose, onPOCreated }) => {
  const { theme } = useTheme();
  const token = localStorage.getItem("token");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });
  const [poNumber, setPONumber] = useState("");
  const [poDate, setPODate] = useState(new Date().toISOString().slice(0, 10));
  const [taxRate, setTaxRate] = useState("7.5");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setError("");
    try {
      const result = await api.products.getAll(token, { limit: 1000 });
      setProducts(
        Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [],
      );
    } catch (err) {
      setError(err?.message || "Unable to load products. Please try again.");
    } finally {
      setLoadingProducts(false);
    }
  }, [token]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => void fetchProducts(), 0);
    return () => clearTimeout(timer);
  }, [open, fetchProducts]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (Number(item.unit_price) || 0) * (Number(item.quantity) || 0),
        0,
      ),
    [items],
  );
  const vat = subtotal * ((Number(taxRate) || 0) / 100);
  const total = Math.max(0, subtotal + vat - (Number(discount) || 0));

  if (!open) return null;

  const updateCustomer = (field, value) =>
    setCustomer((previous) => ({ ...previous, [field]: value }));
  const addItem = () =>
    setItems((previous) => [
      ...previous,
      {
        key: `${Date.now()}-${Math.random()}`,
        product_id: "",
        quantity: 1,
        unit_price: "",
      },
    ]);
  const updateItem = (key, field, value) =>
    setItems((previous) =>
      previous.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  const removeItem = (key) =>
    setItems((previous) => previous.filter((item) => item.key !== key));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (
      !customer.name.trim() ||
      !customer.email.trim() ||
      !customer.email.includes("@")
    ) {
      setError("Enter the customer's name and a valid email address.");
      return;
    }
    if (!poNumber.trim()) {
      setError("PO Number is required.");
      return;
    }
    if (
      !items.length ||
      items.some(
        (item) =>
          !item.product_id ||
          Number(item.quantity) < 1 ||
          Number(item.unit_price) <= 0,
      )
    ) {
      setError(
        "Add at least one product and provide a valid quantity and agreed unit price for each item.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.quotes.registerPO(token, {
        source: "registered_po",
        source_type: "registered_po",
        is_registered_po: true,
        status: "accepted",
        po_number: poNumber.trim(),
        po_date: poDate,
        customer_name: customer.name.trim(),
        customer_email: customer.email.trim(),
        customer_phone: customer.phone.trim(),
        customer_company: customer.company.trim(),
        customer_address: customer.address.trim(),
        tax_rate: Number(taxRate) || 0,
        discount: Number(discount) || 0,
        notes: notes.trim(),
        items: items.map(({ product_id, quantity, unit_price }) => ({
          product_id,
          quantity: Number(quantity),
          unit_price: Number(unit_price),
        })),
      });
      const created =
        result.data?.quote || result.data || result.quote || result;
      onPOCreated(created);
      setCustomer({ name: "", email: "", phone: "", company: "", address: "" });
      setPONumber("");
      setItems([]);
      setNotes("");
    } catch (err) {
      setError(
        err?.body?.message || err?.message || "Failed to record PO Number.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 ${theme === "dark" ? "dark" : ""}`}
      role="dialog"
      aria-modal="true"
      onClick={(event) =>
        event.target === event.currentTarget && !submitting && onClose()
      }
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-[#2A2A2A] dark:bg-[#1A1A1A]"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-[#2A2A2A]">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Record PO Number
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Capture an already-agreed order, prices and terms.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <section>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Customer &amp; PO Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Customer Name *
                <input
                  required
                  value={customer.name}
                  onChange={(event) =>
                    updateCustomer("name", event.target.value)
                  }
                  className={`${inputClass} mt-1`}
                  placeholder="Customer name"
                />
              </label>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Email *
                <input
                  required
                  type="email"
                  value={customer.email}
                  onChange={(event) =>
                    updateCustomer("email", event.target.value)
                  }
                  className={`${inputClass} mt-1`}
                  placeholder="customer@example.com"
                />
              </label>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Phone
                <input
                  value={customer.phone}
                  onChange={(event) =>
                    updateCustomer("phone", event.target.value)
                  }
                  className={`${inputClass} mt-1`}
                  placeholder="+234…"
                />
              </label>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Company
                <input
                  value={customer.company}
                  onChange={(event) =>
                    updateCustomer("company", event.target.value)
                  }
                  className={`${inputClass} mt-1`}
                  placeholder="Company name"
                />
              </label>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300 sm:col-span-2">
                Address
                <input
                  value={customer.address}
                  onChange={(event) =>
                    updateCustomer("address", event.target.value)
                  }
                  className={`${inputClass} mt-1`}
                  placeholder="Delivery / billing address"
                />
              </label>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                PO Number *
                <input
                  required
                  value={poNumber}
                  onChange={(event) => setPONumber(event.target.value)}
                  className={`${inputClass} mt-1`}
                  placeholder="e.g. PO-2026-0456"
                />
              </label>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                PO Date
                <input
                  type="date"
                  value={poDate}
                  onChange={(event) => setPODate(event.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </label>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Products on the PO *
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Enter the agreed unit prices from the client PO.
                </p>
              </div>
              <button
                type="button"
                onClick={addItem}
                disabled={loadingProducts}
                className="inline-flex items-center gap-1 rounded-lg bg-[#C3110C]/10 px-3 py-2 text-xs font-medium text-[#C3110C] hover:bg-[#C3110C]/20 disabled:opacity-50 dark:text-[#E6501B]"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
            {loadingProducts ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading products…
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 py-7 text-center text-sm text-gray-500 dark:border-gray-700">
                No products added yet.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => {
                  const product = products.find(
                    (entry) => String(entry.id) === String(item.product_id),
                  );
                  return (
                    <div
                      key={item.key}
                      className="grid items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-[#2A2A2A] dark:bg-[#212121] sm:grid-cols-[minmax(0,1fr)_90px_145px_36px]"
                    >
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Product {index + 1}
                        <select
                          required
                          value={item.product_id}
                          onChange={(event) =>
                            updateItem(
                              item.key,
                              "product_id",
                              event.target.value,
                            )
                          }
                          className={`${inputClass} mt-1`}
                        >
                          <option value="">Select product…</option>
                          {products.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.name}
                              {entry.sku ? ` (${entry.sku})` : ""}
                            </option>
                          ))}
                        </select>
                        {product?.unit && (
                          <span className="mt-1 block text-[11px] text-gray-500">
                            Unit: {product.unit}
                          </span>
                        )}
                      </label>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Qty
                        <input
                          required
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(item.key, "quantity", event.target.value)
                          }
                          className={`${inputClass} mt-1`}
                        />
                      </label>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Unit Price (₦)
                        <input
                          required
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(event) =>
                            updateItem(
                              item.key,
                              "unit_price",
                              event.target.value,
                            )
                          }
                          className={`${inputClass} mt-1`}
                          placeholder="0.00"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label="Remove product"
                        className="mb-1 rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {product?.description && (
                        <p className="text-xs text-gray-500 sm:col-span-3">
                          {product.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
              VAT / Tax Rate (%)
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxRate}
                onChange={(event) => setTaxRate(event.target.value)}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Discount (₦)
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 sm:col-span-2">
              Terms &amp; Notes
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={`${inputClass} mt-1 resize-y`}
                placeholder="Agreed payment, delivery terms or other PO notes"
              />
            </label>
          </section>

          <div className="ml-auto max-w-sm space-y-1 rounded-lg bg-gray-50 p-4 text-sm dark:bg-[#212121]">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal</span>
              <span>₦{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>VAT ({Number(taxRate) || 0}%)</span>
              <span>₦{money(vat)}</span>
            </div>
            {Number(discount) > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Discount</span>
                <span>−₦{money(discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900 dark:border-[#3A3A3A] dark:text-white">
              <span>Total</span>
              <span className="text-[#C3110C] dark:text-[#E6501B]">
                ₦{money(total)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-[#2A2A2A] dark:bg-[#212121]">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || loadingProducts || !items.length}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C3110C] px-4 py-2 text-sm font-medium text-white hover:bg-[#a80e0a] disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}Register
            PO Number
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
};

export default RecordPONumberDialog;
