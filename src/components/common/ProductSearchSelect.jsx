import { useState, useRef, useEffect, useMemo } from "react";
// import { createPortal } from "react-dom";
import { Search, Check, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

/**
 * Searchable product picker.
 * - Filters products by name / SKU as you type
 * - Opens full list on focus
 * - Keyboard navigation (↑ ↓ Enter Esc)
 * - "Add product" fallback when no results and `onAddProduct` provided
 */
const ProductSearchSelect = ({
  products = [],
  value = "",
  onChange,
  placeholder = "Select a product…",
  disabled = false,
  required = false,
  onAddProduct, // Optional: pass a function to handle "Add product" click
  defaultSelectId,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === String(value)),
    [products, value],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q),
    );
  }, [products, query]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
        setHighlightedIndex(0);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const item = listRef.current.querySelector(
      `[data-index="${highlightedIndex}"]`,
    );
    if (item) item.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);

  const appliedDefault = useRef(false);
  useEffect(() => {
    if (appliedDefault.current) return;
    if (!defaultSelectId) return;
    const exists = products.some(
      (p) => String(p.id) === String(defaultSelectId),
    );
    if (exists && String(value) !== String(defaultSelectId)) {
      onChange(String(defaultSelectId));
      appliedDefault.current = true;
    }
  }, [defaultSelectId, products, onChange, value]);

  const selectProduct = (product) => {
    onChange(String(product.id));
    setOpen(false);
    setQuery("");
    setHighlightedIndex(0);
    inputRef.current?.blur();
  };

  const handleAddProduct = () => {
    setOpen(false);
    setQuery("");
    setHighlightedIndex(0);
    if (onAddProduct) {
      onAddProduct();
    } else {
      // Default: navigate to add-product with `from` so they can come back
      const currentPath = window.location.pathname + window.location.search;
      navigate("/dashboard/products/add", {
        state: { from: currentPath, returnToDialog: true },
      });
    }
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
        setHighlightedIndex(0);
        inputRef.current?.focus();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightedIndex]) {
          selectProduct(filtered[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setQuery("");
        setHighlightedIndex(0);
        inputRef.current?.blur();
        break;
      case "Tab":
        // Let tab close the dropdown
        setOpen(false);
        setQuery("");
        setHighlightedIndex(0);
        break;
      default:
        break;
    }
  };

  const displayValue = open ? query : selectedProduct?.name || "";

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value || ""}
          required
          onChange={() => {}}
          className="absolute opacity-0 pointer-events-none -z-10 w-px h-px"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(0);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className={`w-full pl-9 pr-8 py-2 text-sm rounded-lg border outline-none transition focus:ring-2 focus:ring-[#C3110C] ${
            isDark
              ? "border-[#2A2A2A] bg-[#1A1A1A] text-white placeholder-gray-500"
              : "border-gray-200 bg-white text-gray-900 placeholder-gray-400"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
          autoComplete="off"
        />
        {selectedProduct && !open && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setQuery("");
            }}
            aria-label="Clear selection"
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md ${
              isDark
                ? "text-gray-500 hover:text-white hover:bg-[#2A2A2A]"
                : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div
          className={`absolute z-50 left-0 right-0 mt-1 rounded-lg border shadow-xl overflow-hidden ${
            isDark
              ? "bg-[#1A1A1A] border-[#2A2A2A]"
              : "bg-white border-gray-200"
          }`}
        >
          <div
            ref={listRef}
            role="listbox"
            className="max-h-64 overflow-y-auto"
          >
            {filtered.length === 0 ? (
              <div className="p-4 text-center">
                <p
                  className={`text-sm mb-3 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No products match "{query}"
                </p>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add a new product
                </button>
              </div>
            ) : (
              <>
                {filtered.map((product, index) => {
                  const isSelected = String(product.id) === String(value);
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      data-index={index}
                      onClick={() => selectProduct(product)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      role="option"
                      aria-selected={isSelected}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${
                        isHighlighted
                          ? isDark
                            ? "bg-[#2A2A2A]"
                            : "bg-gray-100"
                          : isDark
                            ? "hover:bg-[#2A2A2A]"
                            : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className={`truncate font-medium ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {product.name}
                        </div>
                        <div
                          className={`text-xs truncate ${
                            isDark ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          {product.sku || "No SKU"}
                          {product.Category?.name
                            ? ` · ${product.Category.name}`
                            : ""}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#C3110C] shrink-0" />
                      )}
                    </button>
                  );
                })}
                {filtered.length > 0 && (
                  <div
                    className={`border-t p-2 ${
                      isDark ? "border-[#2A2A2A]" : "border-gray-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className={`w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isDark
                          ? "text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Can't find it? Add a new product
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearchSelect;
