import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";

/**
 * Dialog for creating a new manual quote from email requests.
 * Matches backend expectations: customer_name, customer_email, items: [{ product_id, quantity }]
 */
const AddQuoteDialog = ({ open, onClose, onQuoteCreated }) => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  // State for products from API
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);

  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const result = await api.products.getAll(token, { limit: 1000 });
      // Handle different response structures
      const data = result.data || result || [];
      setProducts(data);
    } catch (err) {
      setProductsError(err.response?.data?.message || "Failed to load products");
      // Fallback to empty array
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [token]);

  // Fetch products from API when dialog opens, but defer the update until after
  // the render cycle to avoid synchronous state updates during the effect.
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      void fetchProducts();
    }, 0);

    return () => clearTimeout(timer);
  }, [open, fetchProducts]);

  if (!open) return null;

  const handleCustomerChange = (field, value) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddProduct = () => {
    setSelectedProducts((prev) => [
      ...prev,
      { product_id: "", quantity: 1, key: Date.now() + Math.random() },
    ]);
  };

  const handleProductChange = (key, field, value) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveProduct = (key) => {
    setSelectedProducts((prev) => prev.filter((item) => item.key !== key));
  };

  const validateForm = () => {
    if (!customerData.name.trim()) {
      setError("Customer name is required");
      return false;
    }
    if (!customerData.email.trim()) {
      setError("Customer email is required");
      return false;
    }
    if (!customerData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (selectedProducts.length === 0) {
      setError("Please add at least one product");
      return false;
    }
    for (const item of selectedProducts) {
      if (!item.product_id) {
        setError("Please select a product for all items");
        return false;
      }
      if (!item.quantity || item.quantity < 1) {
        setError("Please enter a valid quantity for all items");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Format payload to match backend expectations
      const payload = {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        customer_company: customerData.company,
        customer_address: customerData.address,
        items: selectedProducts.map((item) => ({
          product_id: item.product_id,
          quantity: parseInt(item.quantity, 10),
        })),
      };

      // Use api.quotes.create - no token needed for public create
      const result = await api.quotes.create(payload);
      const newQuote = result.data || result;

      // Reset form
      setCustomerData({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
      });
      setSelectedProducts([]);

      toast.success("Quote created successfully!");
      onQuoteCreated(newQuote);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quote");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to get product display name
  const getProductDisplay = (product) => {
    if (!product) return "";
    return `${product.name} (${product.sku || "No SKU"})`;
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 ${theme === "dark" ? "dark" : ""}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Quote from Email Request
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create a new quote for a customer request received via email
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Customer Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Customer Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => handleCustomerChange("name", e.target.value)}
                    placeholder="Customer name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C3110C]"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => handleCustomerChange("email", e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C3110C]"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => handleCustomerChange("phone", e.target.value)}
                    placeholder="+234 xxx xxx xxxx"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C3110C]"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={customerData.company}
                    onChange={(e) => handleCustomerChange("company", e.target.value)}
                    placeholder="Company name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C3110C]"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={customerData.address}
                  onChange={(e) => handleCustomerChange("address", e.target.value)}
                  placeholder="Street address"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C3110C]"
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Products Requested *
              </h3>
              <button
                onClick={handleAddProduct}
                disabled={submitting || loadingProducts}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#C3110C]/10 text-[#C3110C] dark:text-[#E6501B] hover:bg-[#C3110C]/20 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {/* Product loading state */}
            {loadingProducts && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#C3110C]" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  Loading products...
                </span>
              </div>
            )}

            {/* Product error state */}
            {productsError && !loadingProducts && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {productsError}
                </p>
                <button
                  onClick={fetchProducts}
                  className="mt-2 text-sm text-[#C3110C] hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Product selection */}
            {!loadingProducts && !productsError && (
              <div className="space-y-3">
                {selectedProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                    No products added yet. Click "Add Product" to get started.
                  </p>
                ) : (
                  selectedProducts.map((item) => {
                    const selectedProduct = products.find(p => p.id === item.product_id);
                    return (
                      <div
                        key={item.key}
                        className="flex gap-3 items-end p-3 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1A1A1A]"
                      >
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Product
                          </label>
                          <select
                            value={item.product_id}
                            onChange={(e) =>
                              handleProductChange(item.key, "product_id", e.target.value)
                            }
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C3110C]"
                          >
                            <option value="">Select a product...</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {getProductDisplay(product)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleProductChange(
                                item.key,
                                "quantity",
                                parseInt(e.target.value, 10) || 1
                              )
                            }
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C3110C]"
                          />
                        </div>

                        {/* Show selected product details */}
                        {selectedProduct && (
                          <div className="flex-1 text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                            <div>SKU: {selectedProduct.sku || "—"}</div>
                            <div>Stock: {selectedProduct.stock_quantity ?? "—"}</div>
                          </div>
                        )}

                        <button
                          onClick={() => handleRemoveProduct(item.key)}
                          disabled={submitting}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#212121]">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedProducts.length === 0 || loadingProducts}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            {submitting ? "Creating..." : "Create Quote"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddQuoteDialog;