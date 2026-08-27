import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import DataTable from "../../components/common/DataTable";
import toast from "react-hot-toast";
import { Search, Trash2, Pencil, Plus, Loader2, AlertTriangle, Package, CheckCircle2, XCircle, MinusCircle, FileText, Printer } from "lucide-react";
import { useDashboard } from "../../context/DashboardContext";

const Products = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    products,
    productsLoading,
    categories,
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    deleteProduct,
  } = useDashboard();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportDropdownRef = useRef(null);

  // ✅ FRONTEND FILTERING (No API calls!)
  const filteredProducts = useMemo(() => {
    let result = products;

    // Search by name or SKU
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        p.sku.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by Category
    if (category) {
      result = result.filter(p => p.category_id === category);
    }

    // Filter by Stock Status
    if (status === "In Stock") {
      result = result.filter(p => p.stock_quantity > 0);
    } else if (status === "Out of Stock") {
      result = result.filter(p => p.stock_quantity <= 0);
    }

    return result;
  }, [products, search, category, status]);

  // ✅ PAGINATION (Calculated on frontend)
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // ✅ RESET PAGE when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, status]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) setIsExportOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [exportDropdownRef]);

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

  // ✅ EXPORTS
  const exportToExcel = () => {
    if (filteredProducts.length === 0) return toast.error("No products to export!");
    let csvContent = "\uFEFF"; 
    csvContent += "ID,Name,Category,SKU,Stock,Status,Created At\n";
    filteredProducts.forEach(p => {
      const status = p.status === "active" ? "Active" : "Inactive";
      csvContent += `"'${p.id}","${p.name}","${p.Category?.name || ""}","${p.sku}",${p.stock_quantity},"${status}","'${new Date(p.created_at).toLocaleDateString()}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "products_export.csv"; 
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
    toast.success("Excel file downloaded successfully!");
  };

  const exportToPDF = () => {
    if (filteredProducts.length === 0) return toast.error("No products to export!");
    let htmlContent = `<html><head><title>Product Report</title><style>body{font-family:Arial;padding:20px}h1{color:#C3110C}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background-color:#C3110C;color:white}</style></head><body><h1>Product Report</h1><p>Generated on: ${new Date().toLocaleString()}</p><table><thead><tr><th>#</th><th>Name</th><th>Category</th><th>SKU</th><th>Stock</th><th>Status</th></tr></thead><tbody>`;
    filteredProducts.forEach((p, index) => {
      const status = p.status === "active" ? "Active" : "Inactive";
      htmlContent += `<tr><td>${index + 1}</td><td>${p.name}</td><td>${p.Category?.name || ""}</td><td>${p.sku}</td><td>${p.stock_quantity}</td><td>${status}</td></tr>`;
    });
    htmlContent += `</tbody></table></body></html>`;
    const blob = new Blob([htmlContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "products_report.pdf"; 
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
    toast.success("PDF downloaded successfully!");
  };

  const handlePrint = () => {
    if (filteredProducts.length === 0) return toast.error("No products to print!");
    window.print();
    setIsExportOpen(false);
  };

  const getStockIcon = (stock) => {
    if (stock === 0) return <XCircle className="w-4 h-4" />;
    if (stock < 10) return <MinusCircle className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const getStockColor = (stock) => {
    if (stock === 0) return isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700';
    if (stock < 10) return isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
    return isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700';
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-800"}`}>
          <CheckCircle2 className="w-3 h-3" /> Active
        </span>
      );
    } else {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? "bg-red-900/30 text-red-400" : "bg-red-100 text-red-800"}`}>
          <XCircle className="w-3 h-3" /> Inactive
        </span>
      );
    }
  };

  const columns = [
    { key: "rowNumber", label: "#" },
    { key: "name", label: "Product", render: (row) => (
      <div className="flex items-center gap-3">
        {row.image_url ? (
          <img src={row.image_url} alt={row.name} className="w-10 h-10 rounded-lg object-cover border" onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${isDark ? 'bg-[#242424] border-[#3A3A3A]' : 'bg-gray-100 border-gray-200'}`}>
            <Package className={`w-5 h-5 ${isDark ? 'text-[#C3110C]' : 'text-[#C3110C]'}`} />
          </div>
        )}
        <div>
          <button onClick={() => navigate(`/dashboard/products/${row.id}`)} className={`text-sm font-medium text-left underline-offset-2 hover:underline cursor-pointer ${isDark ? 'text-white hover:text-[#C3110C]' : 'text-gray-900 hover:text-[#C3110C]'}`}>{row.name}</button>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>SKU: {row.sku}</div>
        </div>
      </div>
    )},
    { key: "category", label: "Category", render: (row) => <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{row.Category?.name || "Uncategorized"}</span> },
    { key: "stock", label: "Stock", render: (row) => (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStockColor(row.stock_quantity)}`}>
        {getStockIcon(row.stock_quantity)} {row.stock_quantity}
      </span>
    )},
    { key: "status", label: "Status", render: (row) => getStatusBadge(row.status) },
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(`/dashboard/products/edit/${row.id}`)} className={`cursor-pointer rounded-lg border p-2 transition ${isDark ? 'border-gray-600 text-gray-300 hover:border-[#C3110C]' : 'border-gray-200 text-gray-600 hover:border-[#C3110C]'}`}>
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => { setDeleteTarget(row); setReason(""); }} className={`cursor-pointer rounded-lg border p-2 transition ${isDark ? 'border-gray-600 text-gray-300 hover:border-red-500' : 'border-gray-200 text-gray-600 hover:border-red-500'}`}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )},
  ];

  // ✅ ROW NUMBERS
  const processedData = paginatedProducts.map((item, index) => ({
    ...item,
    rowNumber: startIndex + index + 1,
  }));

  if (productsLoading && products.length === 0) {
    return (
      <div className="relative z-10 min-h-screen p-6">
        <div className={`h-8 w-48 rounded-lg mb-6 animate-pulse ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}></div>
        <div className={`h-40 rounded-xl border animate-pulse ${isDark ? 'border-[#2A2A2A] bg-[#1A1A1A]' : 'border-gray-200 bg-white'}`}>
          <div className={`p-4 flex gap-4`}>
            {[1,2,3,4,5].map(i => <div key={i} className={`h-4 w-32 rounded ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}></div>)}
          </div>
          <div className="p-4 space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className={`h-10 w-full rounded ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-200'}`}></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative z-10 min-h-screen p-6 transition-colors duration-300 `}>
      
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

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Products</h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your product catalog</p>
        </div>
        <button onClick={() => navigate("/dashboard/products/add")} className="cursor-pointer rounded-lg bg-[#C3110C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#740A03] flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className={`mb-6 rounded-xl border p-4 shadow-sm transition-colors duration-300 ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Search className="w-5 h-5" /></span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..." className={`w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[#C3110C] ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A] text-white" : "bg-white border-gray-200"}`} />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A] text-white" : "bg-white border-gray-200"}`}>
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A] text-white" : "bg-white border-gray-200"}`}>
            <option value="">All Stock</option>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          
          <div className="relative" ref={exportDropdownRef}>
            <button onClick={() => setIsExportOpen(!isExportOpen)} className={`px-4 py-2 text-sm font-medium rounded-lg border cursor-pointer transition ${isDark ? 'border-[#2A2A2A] text-gray-300 hover:bg-[#212121]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Export ▼</button>
            {isExportOpen && (
              <div className={`absolute top-12 right-0 z-50 w-40 rounded-lg border shadow-xl transition-colors ${isDark ? 'border-[#2A2A2A] bg-[#1A1A1A]' : 'border-gray-200 bg-white'}`}>
                <div className="p-2 flex flex-col gap-1">
                  <button onClick={exportToExcel} className={`w-full text-left px-3 py-2 text-sm rounded transition flex items-center gap-1.5 ${isDark ? 'hover:bg-[#212121] text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}><FileText className="w-4 h-4" /> Excel</button>
                  <button onClick={exportToPDF} className={`w-full text-left px-3 py-2 text-sm rounded transition flex items-center gap-1.5 ${isDark ? 'hover:bg-[#212121] text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}><FileText className="w-4 h-4" /> PDF</button>
                  <button onClick={handlePrint} className={`w-full text-left px-3 py-2 text-sm rounded transition flex items-center gap-1.5 ${isDark ? 'hover:bg-[#212121] text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}><Printer className="w-4 h-4" /> Print</button>
                </div>
              </div>
            )}
          </div>
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

export default Products;