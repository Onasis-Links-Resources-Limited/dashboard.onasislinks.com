import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import DataTable from "../../components/common/DataTable";
import toast from "react-hot-toast";
import {
  Search,
  Trash2,
  Pencil,
  Plus,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useCategories } from "../../hooks/useCategories";
import CategoryFormModal from "../../components/categories/CategoryFormModal";
import CategoriesSkeleton from "../../components/categories/CategoriesSkeleton";

const Categories = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    categories,
    loading,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    itemsPerPage,
    totalItems,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reason, setReason] = useState("");

  const handleSubmit = async (fromData) => {
    setIsSubmitting(true);
    if (editingCategory) {
      await updateCategory(editingCategory.id, fromData);
    } else {
      await createCategory(fromData);
    }
    setIsSubmitting(false);
    setEditingCategory(null);
  };

  const handleDelete = async () => {
    if (!reason.trim()) {
      toast.error("You must provide a reason to proceed.");
      return;
    }
    setIsSubmitting(true);
    await deleteCategory(deleteTarget.id);
    setIsSubmitting(false);
    setDeleteTarget(null);
    setReason("");
  };

  const columns = [
    { key: "rowNumber", label: "#" },
    {
      key: "name",
      label: "Category Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image_url ? (
            <img
              src={row.image_url}
              alt={row.name}
              className="w-20 h-14 rounded-lg object-cover border"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-lg border flex items-center justify-center ${isDark ? "bg-[#242424] border-[#3A3A3A]" : "bg-gray-100 border-gray-200"}`}
            >
              <span
                className={`text-lg font-bold ${isDark ? "text-[#C3110C]" : "text-[#C3110C]"}`}
              >
                {row.name.charAt(0)}
              </span>
            </div>
          )}
          <span
            className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (row) => (
        <span
          className={`text-xs font-mono ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          {row.slug}
        </span>
      ),
    },
    {
      key: "products",
      label: "Products",
      render: (row) => (
        <span
          className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
        >
          {row.product_count}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingCategory(row);
              setIsAddModalOpen(true);
            }}
            className={`rounded-lg border p-2 transition cursor-pointer ${isDark ? "border-gray-600 text-gray-300 hover:border-[#C3110C]" : "border-gray-200 text-gray-600 hover:border-[#C3110C]"}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className={`rounded-lg border p-2 transition cursor-pointer ${isDark ? "border-gray-600 text-gray-300 hover:border-red-500" : "border-gray-200 text-gray-600 hover:border-red-500"}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const processedData = categories.map((item, index) => ({
    ...item,
    rowNumber: startIndex + index + 1,
  }));

   if (loading) return <CategoriesSkeleton />;

  return (
    <div
      className={`relative z-10 min-h-screen p-6 transition-colors duration-300`}
    >
      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md rounded-xl border p-6 shadow-2xl transition-colors ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-200 bg-white text-gray-900"}`}
          >
            <h2 className="text-xl font-bold mb-2">Delete Category</h2>

            {/* Dynamic Warning Message */}
            <div className={`rounded-lg p-3 mb-4 text-sm flex gap-2 ${isDark ? "bg-yellow-900/20 text-yellow-200 border border-yellow-700/50" : "bg-yellow-50 text-yellow-800 border border-yellow-200"}`}>
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Heads up! This will:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Permanently delete this category.</li>
                  {deleteTarget.product_count > 0 && (
                    <li>Make <strong>{deleteTarget.product_count} product(s)</strong> "Uncategorized" until you assign them to a new category.</li>
                  )}
                  {deleteTarget.product_count === 0 && (
                    <li>Not affect any products (there are no products in this category).</li>
                  )}
                </ul>
              </div>
            </div>

            <p
              className={`mb-4 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Are you sure you want to delete "{deleteTarget.name}"?
            </p>

            <label
              className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#C3110C] mb-4 ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white placeholder-gray-400" : "border-gray-300 bg-white text-gray-900"}`}
              rows={3}
              placeholder="Enter your reason..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setReason("");
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${isDark ? "border-[#2A2A2A] text-gray-300 hover:bg-[#212121]" : "border-gray-300 text-gray-700"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#C3110C] text-white hover:bg-[#740A03] transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      <CategoryFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Categories
          </h1>
          <p
            className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            Organize your products
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-lg bg-[#C3110C] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#740A03] cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div
        className={`mb-6 rounded-xl border p-4 shadow-sm ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}
      >
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search categories..."
            className={`w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none focus:border-[#C3110C] ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-300 bg-white text-gray-900"}`}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={processedData}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        startIndex={startIndex}
      />
    </div>
  );
};

export default Categories;
