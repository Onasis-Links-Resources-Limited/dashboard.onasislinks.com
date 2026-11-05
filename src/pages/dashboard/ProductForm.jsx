import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Package, Upload, Loader2, ArrowLeft, Plus, Trash2, FileText, X } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { createProduct, updateProduct } = useDashboard();

  const isEditMode = !!id;
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    sku: "",
    stock_quantity: 0,
    status: "active",
  });
  const [specs, setSpecs] = useState([{ key: "", value: "" }]);
  const [datasheets, setDatasheets] = useState([]);
  const [newDatasheetFiles, setNewDatasheetFiles] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.categories.getAll(token);
        if (response.success) setCategories(response.data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    loadCategories();
  }, []);

  // Load product for edit
  useEffect(() => {
    if (isEditMode) {
      const loadProduct = async () => {
        try {
          const response = await api.products.getOne(token, id);
          if (response.success) {
            setFormData({
              name: response.data.name,
              description: response.data.description || "",
              category_id: response.data.category_id,
              sku: response.data.sku,
              stock_quantity: response.data.stock_quantity,
              status: response.data.status,
            });
            setImagePreview(response.data.image_url);
            
            // ✅ Load Specifications
            if (response.data.specifications && response.data.specifications.length > 0) {
              setSpecs(response.data.specifications);
            }
            
            // ✅ Load Datasheets
            if (response.data.datasheets && response.data.datasheets.length > 0) {
              setDatasheets(response.data.datasheets);
            }
          }
        } catch {
          toast.error("Failed to load product");
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ✅ Handle Spec Changes
  const handleSpecChange = (index, field, value) => {
    const updatedSpecs = [...specs];
    updatedSpecs[index][field] = value;
    setSpecs(updatedSpecs);
  };

  const addSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const removeSpec = (index) => {
    const updatedSpecs = specs.filter((_, i) => i !== index);
    setSpecs(updatedSpecs);
  };

  // ✅ Handle Datasheet File Uploads
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewDatasheetFiles((prev) => [...prev, ...files]);
  };

  const removeNewFile = (index) => {
    const updatedFiles = newDatasheetFiles.filter((_, i) => i !== index);
    setNewDatasheetFiles(updatedFiles);
  };

  const removeExistingDatasheet = (index) => {
    const updated = datasheets.filter((_, i) => i !== index);
    setDatasheets(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    formDataObj.append("description", formData.description);
    formDataObj.append("category_id", formData.category_id);
    formDataObj.append("sku", formData.sku);
    formDataObj.append("stock_quantity", formData.stock_quantity);
    formDataObj.append("status", formData.status);
    
    // ✅ Send Specifications as JSON string
    formDataObj.append("specifications", JSON.stringify(specs.filter(s => s.key && s.value)));
    
    // ✅ Send Existing Datasheets as JSON string (if any)
    if (datasheets.length > 0) {
      formDataObj.append("datasheets", JSON.stringify(datasheets));
    }
    
    // ✅ Send New Datasheet Files
    newDatasheetFiles.forEach((file) => {
      formDataObj.append(`datasheet_files`, file);
    });

    if (imageFile) formDataObj.append("image", imageFile);

    try {
      let success;
      if (isEditMode) {
        success = await updateProduct(id, formDataObj);
      } else {
        success = await createProduct(formDataObj);
      }

      if (success) {
        navigate("/dashboard/products");
      }
    } catch {
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Loading product data...
      </div>
    );

  return (
    <div
      className={`relative z-10 min-h-screen p-6 transition-colors duration-300`}
    >
      <button
        onClick={() => navigate("/dashboard/products")}
        className={`mb-6 flex items-center gap-2 text-sm font-medium transition hover:text-[#C3110C] ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div className="mb-6 flex items-center justify-between">
        <h1
          className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h1>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="cursor-pointer rounded-lg bg-[#C3110C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#740A03] flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Save
          Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div
            className={`rounded-lg border p-6 shadow-sm ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ... same as your existing code ... */}
              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-300 bg-white text-gray-900"}`}
                />
              </div>
              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-300 bg-white text-gray-900"}`}
                ></textarea>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-300 bg-white text-gray-900"}`}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.is_active ? "" : "(Inactive - Hidden)"}
                    </option>
                  ))}
                </select>

                {formData.category_id &&
                  categories.find((cat) => cat.id === formData.category_id)
                    ?.is_active === false && (
                    <div
                      className={`mt-2 p-3 rounded-lg text-xs border ${isDark ? "bg-yellow-900/20 text-yellow-200 border-yellow-700/50" : "bg-yellow-50 text-yellow-800 border-yellow-200"}`}
                    >
                      ⚠️ <strong>Warning:</strong> This category is currently{" "}
                      <strong>Inactive</strong>. Products placed here will NOT
                      be visible to customers on the website.
                    </div>
                  )}
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-300 bg-white text-gray-900"}`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-300 bg-white text-gray-900"}`}
                />
              </div>
              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-300 bg-white text-gray-900"}`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>
          </div>

          {/* ✅ Specifications Section */}
          <div
            className={`rounded-lg border p-6 shadow-sm ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Specifications
            </h2>
            {specs.map((spec, index) => (
              <div key={index} className="flex gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Spec Name (e.g., Speed)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(index, "key", e.target.value)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-300 bg-white text-gray-900"}`}
                />
                <input
                  type="text"
                  placeholder="Value (e.g., 300Mbps)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-300 bg-white text-gray-900"}`}
                />
                <button
                  type="button"
                  onClick={() => removeSpec(index)}
                  className={`p-2 rounded-lg border transition ${isDark ? "border-[#2A2A2A] text-gray-400 hover:text-red-500 hover:border-red-500" : "border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-500"}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpec}
              className={`flex items-center gap-2 text-sm font-medium mt-2 transition hover:text-[#C3110C] ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              <Plus className="w-4 h-4" /> Add Specification
            </button>
          </div>

          {/* ✅ Datasheets Section */}
          <div
            className={`rounded-lg border p-6 shadow-sm ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Datasheets & Downloads
            </h2>
            
            {/* Existing Datasheets */}
            {datasheets.length > 0 && (
              <div className="mb-4 space-y-2">
                {datasheets.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? "border-[#2A2A2A] bg-[#242424]" : "border-gray-200 bg-gray-50"}`}
                  >
                    <span className={`text-sm flex items-center gap-2 truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      <FileText className="w-4 h-4 flex-shrink-0" /> {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExistingDatasheet(index)}
                      className={`p-1 rounded-full transition hover:bg-red-100 dark:hover:bg-red-900/20 ${isDark ? "text-gray-400 hover:text-red-500" : "text-gray-400 hover:text-red-500"}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New File Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              multiple
              className="hidden"
              id="datasheet-upload"
            />
            <label
              htmlFor="datasheet-upload"
              className={`border-2 border-dashed rounded-lg p-6 text-center transition hover:border-[#C3110C] cursor-pointer block ${isDark ? "border-[#2A2A2A] hover:border-[#C3110C]" : "border-gray-300 hover:border-[#C3110C]"}`}
            >
              <div className="mb-2 text-gray-400 mx-auto w-fit">
                <Upload size={32} />
              </div>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Click to upload PDF, DOC, or XLS files
              </p>
            </label>

            {/* Show newly selected files */}
            {newDatasheetFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {newDatasheetFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? "border-[#2A2A2A] bg-[#242424]" : "border-gray-200 bg-gray-50"}`}
                  >
                    <span className={`text-sm flex items-center gap-2 truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      <FileText className="w-4 h-4 flex-shrink-0" /> {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className={`p-1 rounded-full transition hover:bg-red-100 dark:hover:bg-red-900/20 ${isDark ? "text-gray-400 hover:text-red-500" : "text-gray-400 hover:text-red-500"}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="space-y-6">
          <div
            className={`rounded-lg border p-6 shadow-sm ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Product Image
            </h2>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              id="product-image"
            />
            <label
              htmlFor="product-image"
              className={`border-2 border-dashed rounded-lg p-8 text-center transition hover:border-[#C3110C] cursor-pointer block ${isDark ? "border-[#2A2A2A] hover:border-[#C3110C]" : "border-gray-300 hover:border-[#C3110C]"}`}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="max-h-40 mx-auto object-contain rounded-md mb-2"
                />
              ) : (
                <>
                  <div className="mb-2 text-gray-400 mx-auto w-fit">
                    <Package size={40} />
                  </div>
                  <p
                    className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Click to upload
                  </p>
                </>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;