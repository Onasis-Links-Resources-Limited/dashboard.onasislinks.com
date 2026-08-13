import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import quoteAPI from "../../api/quoteAPI";

// Product catalog
const PRODUCTS = [
  {
    productId: "P-001",
    name: "Fiber Optic Cable",
    sku: "FO-001",
    unit: "Box",
    specifications: "10m, Single Mode",
  },
  {
    productId: "P-002",
    name: "5G Antenna",
    sku: "5G-002",
    unit: "Set",
    specifications: "High Gain, Outdoor",
  },
  {
    productId: "P-003",
    name: "Cloud Server Module",
    sku: "CL-003",
    unit: "Unit",
    specifications: "12GB RAM, 500GB SSD",
  },
  {
    productId: "P-004",
    name: "Network Switch 24-Port",
    sku: "NW-004",
    unit: "Set",
    specifications: "Gigabit, Managed",
  },
  {
    productId: "P-005",
    name: "Wireless Router AC1200",
    sku: "WR-005",
    unit: "Set",
    specifications: "Dual Band",
  },
  {
    productId: "P-006",
    name: "UPS Backup Unit",
    sku: "UPS-006",
    unit: "Set",
    specifications: "1500VA",
  },
  {
    productId: "P-007",
    name: "CAT6 Ethernet Cable",
    sku: "CB-007",
    unit: "Box",
    specifications: "305m Box",
  },
  {
    productId: "P-008",
    name: "IP Security Camera",
    sku: "CAM-008",
    unit: "Set",
    specifications: "4MP, Night Vision",
  },
  {
    productId: "P-009",
    name: "9U Rack Wall Mount",
    sku: "RK-009",
    unit: "Set",
    specifications: "600mm x 600mm",
  },
  {
    productId: "P-010",
    name: "42U Rack",
    sku: "RK-010",
    unit: "Set",
    specifications: "800mm x 1000mm",
  },
  {
    productId: "P-011",
    name: "PVC Trunk (Round)",
    sku: "PVC-011",
    unit: "M",
    specifications: "20mm x 12mm",
  },
];

/**
 * Dialog for creating a new manual quote from email requests.
 * Allows selection of customer details and products with quantities.
 */
const AddQuoteDialog = ({ open, onClose, onQuoteCreated }) => {
  const { theme } = useTheme();
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

  if (!open) return null;

  const handleCustomerChange = (field, value) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddProduct = () => {
    setSelectedProducts((prev) => [
      ...prev,
      { productId: "", quantity: 1, key: Date.now() },
    ]);
  };

  const handleProductChange = (key, field, value) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
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
      if (!item.productId) {
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
      const payload = {
        customer: customerData,
        items: selectedProducts.map((item) => ({
          productId: item.productId,
          quantity: parseInt(item.quantity, 10),
        })),
      };

      const newQuote = await quoteAPI.create(payload);
      onQuoteCreated(newQuote);
      // Reset form
      setCustomerData({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
      });
      setSelectedProducts([]);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create quote");
    } finally {
      setSubmitting(false);
    }
  };

  const getProductName = (productId) => {
    const product = PRODUCTS.find((p) => p.productId === productId);
    return product ? product.name : "";
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 ${theme === "dark" ? "dark" : ""}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
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

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Customer Information Section */}
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
                    onChange={(e) =>
                      handleCustomerChange("name", e.target.value)
                    }
                    placeholder="Customer name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) =>
                      handleCustomerChange("email", e.target.value)
                    }
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) =>
                      handleCustomerChange("phone", e.target.value)
                    }
                    placeholder="+234 xxx xxx xxxx"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) =>
                      handleCustomerChange("company", e.target.value)
                    }
                    placeholder="Company name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) =>
                    handleCustomerChange("address", e.target.value)
                  }
                  placeholder="Street address"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                disabled={submitting}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            <div className="space-y-3">
              {selectedProducts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                  No products added yet. Click "Add Product" to get started.
                </p>
              ) : (
                selectedProducts.map((item) => (
                  <div
                    key={item.key}
                    className="flex gap-3 items-end p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Product
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) =>
                          handleProductChange(
                            item.key,
                            "productId",
                            e.target.value,
                          )
                        }
                        disabled={submitting}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a product...</option>
                        {PRODUCTS.map((product) => (
                          <option
                            key={product.productId}
                            value={product.productId}
                          >
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleProductChange(
                            item.key,
                            "quantity",
                            parseInt(e.target.value, 10) || 1,
                          )
                        }
                        disabled={submitting}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {item.productId && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                        {(() => {
                          const product = PRODUCTS.find(
                            (p) => p.productId === item.productId,
                          );
                          return product ? `${product.unit}` : "";
                        })()}
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
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || selectedProducts.length === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Quote"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddQuoteDialog;
