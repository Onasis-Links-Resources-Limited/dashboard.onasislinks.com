import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("token");

  const fetchProducts = useCallback(async () => {
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
      }
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [token, search, category, status, date, currentPage]);

  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts();
    };

    loadProducts();
  }, [fetchProducts]);

  const createProduct = async (formData) => {
    try {
      const response = await api.products.create(token, formData);
      if (response.success) {
        toast.success("Product created successfully!");
        fetchProducts();
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
        fetchProducts();
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
        fetchProducts();
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

  return {
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
    reload: fetchProducts,
  };
};