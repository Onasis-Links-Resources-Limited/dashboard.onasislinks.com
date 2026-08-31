import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const token = localStorage.getItem("token");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.categories.getAll(token);
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error("Failed to load categories.");
      console.error(error)
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const task = setTimeout(() => {
      fetchCategories();
    }, 0);

    return () => clearTimeout(task);
  }, [fetchCategories]);

  const createCategory = async (formData) => {
    try {
      const response = await api.categories.create(token, formData);
      if (response.success) {
        toast.success("Category created successfully!");
        fetchCategories();
        return true;
      } else {
        toast.error(response.message || "Failed to create category.");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error(error)
      return false;
    }
  };

  const updateCategory = async (id, formData) => {
    try {
      const response = await api.categories.update(token, id, formData);
      if (response.success) {
        toast.success("Category updated successfully!");
        fetchCategories();
        return true;
      } else {
        toast.error(response.message || "Failed to update category.");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error(error)
      return false;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const response = await api.categories.delete(token, id);
      if (response.success) {
        toast.success("Category deleted successfully!");
        fetchCategories();
        return true;
      } else {
        toast.error(response.message || "Failed to delete category.");
        return false;
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      console.error(error)
      return false;
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const startIndex = ((Number(currentPage) || 1) - 1) * itemsPerPage;
  const paginated = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  return {
    categories: paginated,
    allCategories: categories,
    loading,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    itemsPerPage,
    totalItems: filteredCategories.length,
    createCategory,
    updateCategory,
    deleteCategory,
    reload: fetchCategories,
  };
};