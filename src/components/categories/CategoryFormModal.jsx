import { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  Upload,
  ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const CategoryFormModal = ({
  isOpen,
  onClose,
  category,
  onSubmit,
  isSubmitting,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
      setIsActive(category.is_active);
      setImagePreview(category.image_url || null);
    } else {
      setName("");
      setDescription("");
      setIsActive(true);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Preview the selected file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description || "");
    formData.append("is_active", isActive);
    if (imageFile) {
      formData.append("image", imageFile); // This matches multer's upload.single('image')
    }

    await onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-md rounded-xl border p-6 shadow-2xl transition-colors ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-200 bg-white text-gray-900"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {category ? "Edit Category" : "Add New Category"}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="flex items-center gap-6">
            <div
              className={`w-36 h-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden ${isDark ? "border-[#3A3A3A] bg-[#242424]" : "border-gray-300 bg-gray-50"}`}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Category Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon
                  className={`w-8 h-8 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                />
              )}
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-1 text-nowrap ${isDark ? "text-gray-300" : "text-gray-700"}`}
              >
                Category Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="category-image"
              />
              <label
                htmlFor="category-image"
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border cursor-pointer transition whitespace-nowrap ${isDark ? "border-[#3A3A3A] text-gray-300 hover:bg-[#242424]" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                <Upload className="w-4 h-4 text-nowrap" /> Upload Image
              </label>
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "border-[#2A2A2A] bg-[#242424] text-white" : "border-gray-300 bg-white text-gray-900"}`}
              placeholder="Enter category name"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "border-[#2A2A2A] bg-[#242424] text-white" : "border-gray-300 bg-white text-gray-900"}`}
              placeholder="Optional description..."
            />
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              Active
            </span>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isActive ? "bg-[#C3110C]" : "bg-gray-200 dark:bg-[#2A2A2A]"}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${isActive ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>
          {/* Inactive Warning */}
          {category && !isActive && (
            <div
              className={`rounded-lg p-3 mb-2 text-xs flex gap-2 ${isDark ? "bg-yellow-900/20 text-yellow-200 border border-yellow-700/50" : "bg-yellow-50 text-yellow-800 border border-yellow-200"}`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Important:</strong> Making this category inactive will
                hide it from the website. Products will not be visible under
                this category until it is re-activated.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${isDark ? "border-[#2A2A2A] text-gray-300 hover:bg-[#242424]" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#C3110C] text-white hover:bg-[#740A03] transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {category ? "Update Category" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
