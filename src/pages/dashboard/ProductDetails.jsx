import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import {
  Package,
  AlertTriangle,
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  Eye,
  Quote,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useDashboard } from "../../context/DashboardContext";

// Skeleton Loader for details page
const ProductDetailsSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bg = isDark ? "bg-[#1A1A1A]" : "bg-gray-200";
  const pulse = `animate-pulse ${bg}`;

  return (
    <div className="relative z-10 min-h-screen p-6">
      <div className={`h-4 w-32 rounded mb-6 ${pulse}`}></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className={`h-96 rounded-xl border ${pulse}`}></div>
          <div className={`h-40 rounded-xl border p-6 ${pulse}`}></div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className={`h-48 rounded-xl border p-6 ${pulse}`}></div>
          <div className={`h-24 rounded-xl border p-6 ${pulse}`}></div>
        </div>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
   const {
      deleteProduct,
    } = useDashboard();

  const handleDelete = async () => {
    if (!reason.trim()) {
      toast.error("You must provide a reason to proceed.");
      return;
    }
    setIsDeleting(true);
    const success = await deleteProduct(deleteTarget.id);
    setIsDeleting(false);
    if (success) {
      setDeleteTarget(null);
      setReason("");
    }
  };

  // Add this inside the component
  const hasFetched = useRef(false);

  useEffect(() => {
    // ✅ Prevent double/triple fetching in React StrictMode
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadProduct = async () => {
      try {
        const response = await api.products.getOne(token, id);
        if (response.success) setProduct(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) return <ProductDetailsSkeleton />;

  // Empty state with icon if product not found
  if (!product) {
    return (
      <div className="relative z-10 min-h-screen p-6 flex flex-col items-center justify-center">
        <XCircle
          className={`w-16 h-16 mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
        />
        <p
          className={`text-lg font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          Product not found.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 bg-[#C3110C] text-white px-6 py-2.5 rounded-lg shadow hover:bg-[#740A03] transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative z-10 min-h-screen p-6 transition-colors duration-300`}
    >

      {/* DELETE WARNING MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-xl border p-6 shadow-2xl transition-colors ${isDark ? 'border-[#2A2A2A] bg-[#1A1A1A] text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Delete Product</h2>
            <div className={`rounded-lg p-3 mb-4 text-sm flex gap-2 ${isDark ? "bg-yellow-900/20 text-yellow-200 border border-yellow-700/50" : "bg-yellow-50 text-yellow-800 border border-yellow-200"}`}>
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Heads up! This will:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Permanently delete this product.</li>
                  <li>Remove it from all associated quotes.</li>
                </ul>
              </div>
            </div>
            <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Are you sure you want to delete "{deleteTarget.name}"?</p>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reason <span className="text-red-500">*</span></label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#C3110C] mb-4 ${isDark ? 'border-[#2A2A2A] bg-[#1A1A1A] text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'}`} rows="3" placeholder="Enter your reason..." />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setDeleteTarget(null); setReason(""); }} className={`px-4 py-2 text-sm font-medium rounded-lg border transition ${isDark ? 'border-[#2A2A2A] text-gray-300 hover:bg-[#212121]' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className={`px-4 py-2 text-sm font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-2 disabled:opacity-50`}>
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />} Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => window.history.back()}
        className={`mb-6 flex items-center gap-2 text-sm font-medium transition hover:text-[#C3110C] ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (Image + Description + Specs) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Image Section */}
          <div
            className={`rounded-xl border overflow-hidden shadow-sm ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}
          >
            <div className="h-96 w-full flex items-center justify-center relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <Package className="w-24 h-24 text-gray-400" />
              )}
              <div
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-md border ${product.status === "active" ? "bg-green-500 text-white border-green-600" : "bg-red-500 text-white border-red-600"}`}
              >
                {product.status === "active" ? "Active" : "Inactive"}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div
            className={`rounded-xl border p-6 shadow-sm ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}
          >
            <h2
              className={`text-lg font-bold mb-4 border-b pb-2 ${isDark ? "text-white border-[#2A2A2A]" : "text-gray-900 border-gray-200"}`}
            >
              Description
            </h2>
            <p
              className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {product.description || "No description provided."}
            </p>
          </div>

          {/* Specifications Section */}
          <div
            className={`rounded-xl border p-6 shadow-sm ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}
          >
            <h2
              className={`text-lg font-bold mb-4 border-b pb-2 ${isDark ? "text-white border-[#2A2A2A]" : "text-gray-900 border-gray-200"}`}
            >
              Specifications
            </h2>
            {product.specifications && product.specifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map((spec, index) => (
                      <tr
                        key={index}
                        className={`border-b last:border-b-0 ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}
                      >
                        <td
                          className={`py-3 font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {spec.key}
                        </td>
                        <td
                          className={`py-3 text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                No specifications provided.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Stats + Actions) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Product Info Card */}
          <div
            className={`rounded-xl border p-6 shadow-sm ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}
          >
            <h1
              className={`text-3xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {product.name}
            </h1>
            <p
              className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              SKU: {product.sku}
            </p>

            <div className="flex items-center justify-between p-4 rounded-lg mb-4">
              <div>
                <p
                  className={`text-xs uppercase font-semibold ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Stock Level
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.stock_quantity > 0 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}
                  >
                    {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                  <span
                    className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {product.stock_quantity}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`rounded-lg p-3 text-center ${isDark ? "bg-[#242424]" : "bg-gray-50"}`}
              >
                <Eye
                  className={`w-4 h-4 mx-auto mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                />
                <p
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Views
                </p>
                <p
                  className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {product.view_count}
                </p>
              </div>
              <div
                className={`rounded-lg p-3 text-center ${isDark ? "bg-[#242424]" : "bg-gray-50"}`}
              >
                <Quote
                  className={`w-4 h-4 mx-auto mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                />
                <p
                  className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  Quotes
                </p>
                <p
                  className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {product.quote_count}
                </p>
              </div>
            </div>

            <p
              className={`mt-4 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Category: {product.Category?.name || "Uncategorized"}
            </p>

            {/* Add inside the Product Info Card */}
            <div
              className={`mt-4 pt-4 border-t ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}
            >
              <p
                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                <strong>Created:</strong>{" "}
                {new Date(product.created_at).toLocaleString()}
              </p>
              <p
                className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                <strong>Updated:</strong>{" "}
                {new Date(product.updated_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Datasheets / Downloads Section */}
          {product.datasheets && product.datasheets.length > 0 ? (
            <div
              className={`rounded-xl border p-6 shadow-sm ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}
            >
              <h2
                className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Downloads
              </h2>
              <div className="space-y-2">
                {product.datasheets.map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-3 rounded-lg border transition ${isDark ? "border-gray-600 hover:border-[#C3110C] hover:text-[#C3110C]" : "border-gray-200 hover:border-[#C3110C] hover:text-[#C3110C]"}`}
                  >
                    <FileText
                      className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    />
                    <span
                      className={`text-sm truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {file.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`rounded-xl border p-6 shadow-sm ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A]" : "border-gray-200 bg-white"}`}
            >
              <h2
                className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Downloads
              </h2>
              <p
                className={`text-sm flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                <FileText className="w-4 h-4" /> No datasheets available for
                this product.
              </p>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  (window.location.href = `/dashboard/products/edit/${product.id}`)
                }
                className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition cursor-pointer ${isDark ? "border-gray-600 text-gray-300 hover:border-[#C3110C] hover:text-[#C3110C]" : "border-gray-300 text-gray-600 hover:border-[#C3110C] hover:text-[#C3110C]"}`}
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => { setDeleteTarget(product); setReason(""); }}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition cursor-pointer ${isDark ? "border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-500" : "border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500"}`}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
