import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const ProductsContext = createContext();

// This context hook intentionally shares the provider module's context API.
// eslint-disable-next-line react-refresh/only-export-components
export const useProductsContext = () => useContext(ProductsContext);

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const token = localStorage.getItem("token");

  const fetchProducts = async (isRefresh = false) => {
    // Only load if not already loaded OR explicitly refreshing
    if (hasLoaded && !isRefresh) return;

    setLoading(true);
    try {
      const response = await api.products.getAll(token, {
        search,
        category,
        status,
        date,
        page: currentPage,
        limit: itemsPerPage,
      });
      if (response.success) {
        setProducts(response.data);
        setHasLoaded(true);
      }
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  // Only fetch when search/filter/page changes if data is already loaded
  useEffect(() => {
    if (!hasLoaded) return;

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [search, category, status, date, currentPage]);

  const createProduct = async (formData) => {
    try {
      const response = await api.products.create(token, formData);
      if (response.success) {
        toast.success("Product created successfully!");
        fetchProducts(true);
        return true;
      } else {
        toast.error(response.message || "Failed to create product.");
        return false;
      }
    } catch {
      toast.error("Network error.");
      return false;
    }
  };

  const updateProduct = async (id, formData) => {
    try {
      const response = await api.products.update(token, id, formData);
      if (response.success) {
        toast.success("Product updated successfully!");
        fetchProducts(true);
        return true;
      } else {
        toast.error(response.message || "Failed to update product.");
        return false;
      }
    } catch {
      toast.error("Network error.");
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await api.products.delete(token, id);
      if (response.success) {
        toast.success("Product deleted successfully!");
        fetchProducts(true);
        return true;
      } else {
        toast.error(response.message || "Failed to delete product.");
        return false;
      }
    } catch {
      toast.error("Network error.");
      return false;
    }
  };

  const value = {
    products,
    loading,
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    date,
    setDate,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    totalItems: products.length,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: () => fetchProducts(true),
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};