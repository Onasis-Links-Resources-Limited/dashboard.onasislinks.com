import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import toast from 'react-hot-toast';
import { TrashIcon, PencilIcon } from "../../components/common/Icons";

const ProductDetails = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // --- GET ID FROM URL ---
  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  const goBack = () => { window.location.href = '/dashboard/products'; };

  // --- STATE ---
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE FOR REASON POPUP ---
  const [reasonPopup, setReasonPopup] = useState({ isOpen: false, type: '', id: null, name: '' });
  const [reasonInput, setReasonInput] = useState("");

  // Load product data
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("products") || "[]");
      setAllProducts(stored);
      const found = stored.find((p) => String(p.id) === String(id));
      setProduct(found || null);
    } catch (error) {
      console.error("Error loading product:", error);
    }
    setLoading(false);
  }, [id]);

  // --- OPEN REASON POPUP ---
  const openReasonPopup = (type) => {
    if (!product) return;
    setReasonPopup({ isOpen: true, type, id: product.id, name: product.name });
    setReasonInput("");
  };

  const closeReasonPopup = () => {
    setReasonPopup({ isOpen: false, type: '', id: null, name: '' });
    setReasonInput("");
  };

  // --- CONFIRM REASON & NAVIGATE ---
  const confirmReasonAction = () => {
    if (!reasonInput.trim()) {
      toast.error("You must provide a reason to proceed.");
      return;
    }

    const { type, id, name } = reasonPopup;

    if (type === 'delete') {
      // DELETE ACTION: Immediately perform deletion
      const updatedArray = allProducts.filter((p) => String(p.id) !== String(id));
      localStorage.setItem("products", JSON.stringify(updatedArray));
      toast.success(`Deleted "${name}". Reason: ${reasonInput}`);
      closeReasonPopup();
      goBack(); 
    } else if (type === 'edit') {
      // EDIT ACTION: Close popup, and navigate to the Edit Page with the reason in the URL
      closeReasonPopup();
      
      // Pass the reason as a query parameter (?reason=...)
      // URL will look like: /dashboard/products/edit/PRD-0001?reason=Changed+Price
      const encodedReason = encodeURIComponent(reasonInput);
      window.location.href = `/dashboard/products/edit/${id}?reason=${encodedReason}`;
    }
  };

  // --- DOWNLOAD PDF ---
  const handleDownloadPDF = () => {
    if (!product) return;
    const content = `
      PRODUCT DETAIL REPORT
      ======================================
      ID:          ${product.id}
      Name:        ${product.name}
      Category:    ${product.category}
      SKU:         ${product.sku}
      Price:       ₦${product.price}
      Stock:       ${product.stock}
      Status:      ${product.isActive ? "Active" : "Inactive"}
      Supplier:    ${product.supplier || "N/A"}
      Description: ${product.description || "N/A"}
      ======================================
    `;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${product.name.replace(/\s+/g, '_')}_details.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started!");
  };

  // --- RENDER LOADING / NOT FOUND ---
  if (loading) return <div className="p-10 text-center text-gray-500">Loading product details...</div>;
  if (!product) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 text-lg font-semibold">Product not found.</p>
        <button onClick={goBack} className="mt-4 bg-[#C3110C] text-white px-6 py-2 rounded-lg shadow hover:bg-[#740A03]">Go Back</button>
      </div>
    );
  }

  return (
    <div className={`relative z-10 min-h-screen p-6 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* --- REASON POPUP (Delete / Edit) --- */}
      {reasonPopup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-xl border p-6 shadow-2xl transition-colors ${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
            <h2 className="text-xl font-bold mb-2">
              {reasonPopup.type === 'delete' ? 'Delete Product' : 'Edit Product'}
            </h2>
            <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {reasonPopup.type === 'delete' 
                ? `Are you sure you want to delete "${reasonPopup.name}"? This action cannot be undone.` 
                : `You are about to edit "${reasonPopup.name}".`}
            </p>
            
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Reason for {reasonPopup.type === 'delete' ? 'deletion' : 'edit'} <span className="text-red-500">*</span>
            </label>
            <textarea 
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#C3110C] mb-4 ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'}`}
              rows="3"
              placeholder="Enter your reason..."
            />

            <div className="flex justify-end gap-3">
              <button onClick={closeReasonPopup} className={`px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-100 transition ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
              <button onClick={confirmReasonAction} className="px-4 py-2 text-sm font-medium rounded-lg bg-[#C3110C] text-white hover:bg-[#740A03] transition">Confirm</button>
            </div>
          </div>
        </div>
      )}
      {/* ----------------------- */}

      {/* --- DEFAULT PRODUCT DETAILS VIEW --- */}
      <button onClick={goBack} className={`mb-6 flex items-center gap-2 text-sm font-medium transition hover:text-[#C3110C] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        ← Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`rounded-xl border overflow-hidden shadow-sm ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="h-96 w-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
              {product.imagePreview ? (
                <img src={product.imagePreview} alt={product.name} className="h-full w-full object-contain p-4" />
              ) : (
                <span className="text-6xl text-gray-400 dark:text-gray-500">🖼️</span>
              )}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-md border ${product.isActive ? 'bg-green-500 text-white border-green-600' : 'bg-red-500 text-white border-red-600'}`}>
                {product.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-6 shadow-sm ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <h2 className={`text-lg font-bold mb-4 border-b pb-2 ${isDark ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'}`}>Description</h2>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {product.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`rounded-xl border p-6 shadow-sm ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <h1 className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</h1>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ID: {product.id} • SKU: {product.sku}</p>
            
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
              <div>
                <p className={`text-xs uppercase font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Price</p>
                <p className="text-2xl font-bold text-[#C3110C]">₦{product.price}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs uppercase font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stock Level</p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}>
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                  <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.stock}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS ON DETAILS PAGE */}
          <div className="flex flex-col gap-3">
            <button onClick={handleDownloadPDF} className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#C3110C] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#740A03]">
              ⬇️ Download PDF
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
              {/* EDIT BUTTON OPENS REASON POPUP & GOES TO EDIT PAGE */}
              <button 
                onClick={() => openReasonPopup('edit')} 
                className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition cursor-pointer ${isDark ? 'border-gray-600 text-gray-300 hover:border-[#C3110C] hover:text-[#C3110C]' : 'border-gray-300 text-gray-600 hover:border-[#C3110C] hover:text-[#C3110C]'}`}
              >
                <PencilIcon className="w-4 h-4" /> Edit
              </button>

              {/* DELETE BUTTON OPENS REASON POPUP & DELETES IN PLACE */}
              <button 
                onClick={() => openReasonPopup('delete')} 
                className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition cursor-pointer ${isDark ? 'border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-500' : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'}`}
              >
                <TrashIcon className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;