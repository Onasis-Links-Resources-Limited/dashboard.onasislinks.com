import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const DashboardContext = createContext();

// This hook intentionally shares the context with DashboardProvider. Keep the
// export here until the hook is moved to a dedicated module.
// eslint-disable-next-line react-refresh/only-export-components
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const token = localStorage.getItem("token");

  // ----- GLOBAL STATE -----
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  // ----- LOADING STATES -----
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // ----- FILTER STATES (Updated instantly on frontend, no API call) -----
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ----- FETCHERS (No search/date/currentPage dependencies!) -----
  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const response = await api.dashboard.getStats(token);
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch {
      toast.error("Failed to load dashboard.");
    } finally {
      setDashboardLoading(false);
    }
  }, [token]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await api.categories.getAll(token);
      if (response.success) {
        setCategories(response.data);
      }
    } catch {
      toast.error("Failed to load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  }, [token]);

  // ✅ Fetch ALL products. Filtering happens on frontend.
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const response = await api.products.getAll(token, {
        page: 1, // Always fetch first page for all
        limit: 1000, // Fetch enough to cache and filter locally
      });
      if (response.success) {
        setProducts(response.data);
      }
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setProductsLoading(false);
    }
  }, [token]);

  // ----- INITIAL LOAD (Runs once) -----
  useEffect(() => {
    // Defer the initial fetches so their loading-state updates do not occur
    // synchronously while React is running this effect.
    const timeoutId = setTimeout(() => {
      fetchDashboard(true);
      fetchCategories(true);
      fetchProducts(true);
    }, 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ----- PRODUCT CRUD -----
  const createProduct = async (formData) => {
    try {
      const response = await api.products.create(token, formData);
      if (response.success) {
        toast.success("Product created successfully!");
        fetchProducts(true);
        return true;
      }
      toast.error(response.message || "Failed to create product.");
      return false;
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
      }
      toast.error(response.message || "Failed to update product.");
      return false;
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
      }
      toast.error(response.message || "Failed to delete product.");
      return false;
    } catch {
      toast.error("Network error.");
      return false;
    }
  };

  // ----- CATEGORY CRUD -----
  const createCategory = async (formData) => {
    try {
      const response = await api.categories.create(token, formData);
      if (response.success) {
        toast.success("Category created successfully!");
        fetchCategories(true);
        return true;
      }
      toast.error(response.message || "Failed to create category.");
      return false;
    } catch {
      toast.error("Network error.");
      return false;
    }
  };

  const updateCategory = async (id, formData) => {
    try {
      const response = await api.categories.update(token, id, formData);
      if (response.success) {
        toast.success("Category updated successfully!");
        fetchCategories(true);
        return true;
      }
      toast.error(response.message || "Failed to update category.");
      return false;
    } catch {
      toast.error("Network error.");
      return false;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const response = await api.categories.delete(token, id);
      if (response.success) {
        toast.success("Category deleted successfully!");
        fetchCategories(true);
        return true;
      }
      toast.error(response.message || "Failed to delete category.");
      return false;
    } catch {
      toast.error("Network error.");
      return false;
    }
  };

  // ----- VALUE TO EXPOSE -----
  return (
    <DashboardContext.Provider
      value={{
        // Data
        products,
        categories,
        dashboardStats,

        // Loading states
        productsLoading,
        categoriesLoading,
        dashboardLoading,

        // Products Filters
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

        // CRUD Actions
        createProduct,
        updateProduct,
        deleteProduct,
        createCategory,
        updateCategory,
        deleteCategory,

        // Refetch (Force refresh)
        refetchProducts: () => fetchProducts(true),
        refetchCategories: () => fetchCategories(true),
        refetchDashboard: () => fetchDashboard(true),
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};