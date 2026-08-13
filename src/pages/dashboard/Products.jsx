import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import DataTable from "../../components/common/DataTable";
import toast from 'react-hot-toast';
import { SearchIcon, CheckIcon, TrashIcon, PencilIcon, XIcon } from "../../components/common/Icons";

const Products = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [currentPage, setCurrentPage] = useState(1);

  // --- DROPDOWN STATES ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportDropdownRef = useRef(null);
  const [dateFilter, setDateFilter] = useState(""); 
  // -----------------------

  const [modalData, setModalData] = useState({ isOpen: false, type: '', id: null, name: '' });
  const [reason, setReason] = useState("");

  const categoriesList = ["RF Materials", "Power", "Fiber Optical Materials", "Miscellaneous", "Network Materials"];

  const defaultProducts = [
    { id: "PRD-0001", name: "RF Amplifier", category: "RF Materials", sku: "RF-001", stock: 45, price: 299.99, description: "High-performance RF amplifier", supplier: "RF Tech Solutions", location: "Warehouse A, Shelf 1", weight: 2.5, isActive: true, createdAt: new Date().toISOString() },
    { id: "PRD-0002", name: "Power Supply Unit", category: "Power", sku: "PW-001", stock: 2, price: 1599.99, description: "Industrial power supply unit", supplier: "Power Systems Inc.", location: "Warehouse B", weight: 3.8, isActive: true, createdAt: new Date().toISOString() },
    { id: "PRD-0003", name: "Fiber Optic Cable", category: "Fiber Optical Materials", sku: "FO-001", stock: 0, price: 2999.99, description: "High-speed fiber optic cable", supplier: "FiberTech Inc.", location: "Data Center A", weight: 15.5, isActive: true, createdAt: new Date().toISOString() },
  ];

  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("products");
    return savedProducts ? JSON.parse(savedProducts) : defaultProducts;
  });

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  // --- CLOSE DROPDOWNS WHEN CLICKING OUTSIDE ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterDropdownRef, exportDropdownRef]);

  // --- FILTER LOGIC ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(searchText) || product.sku.toLowerCase().includes(searchText);
      const matchesCategory = category === "All Categories" || product.category === category;
      
      let matchesDate = true;
      if (dateFilter && product.createdAt) {
        const productDate = new Date(product.createdAt);
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const productDateStr = productDate.toISOString().split('T')[0];

        switch(dateFilter) {
          case 'today': matchesDate = productDateStr === todayStr; break;
          case 'week':
            const weekAgo = new Date(); weekAgo.setDate(today.getDate() - 7);
            matchesDate = productDate >= weekAgo; break;
          case 'month': matchesDate = productDate.getMonth() === today.getMonth() && productDate.getFullYear() === today.getFullYear(); break;
          case 'year': matchesDate = productDate.getFullYear() === today.getFullYear(); break;
          default: matchesDate = true;
        }
      }
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [search, category, dateFilter, products]);

  const productsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const safeCurrentPage = Number(currentPage) || 1;
  const startIndex = (safeCurrentPage - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const openModal = (type, id, name) => {
    setModalData({ isOpen: true, type, id, name });
    setReason("");
  };

  const closeModal = () => {
    setModalData({ isOpen: false, type: '', id: null, name: '' });
    setReason("");
  };

  const confirmAction = () => {
    if (!reason.trim()) {
      toast.error("You must provide a reason to proceed.");
      return;
    }
    const { type, id, name } = modalData;
    if (type === 'delete') {
      setProducts(products.filter((p) => String(p.id) !== String(id)));
      toast.success(`Deleted "${name}" successfully!`);
    } else if (type === 'edit') {
      toast.success(`Proceeding to edit "${name}". Reason given: ${reason}`);
      navigate(`/dashboard/products/edit/${id}`);
    }
    closeModal();
  };

  // --- EXCEL EXPORT ---
  const exportToExcel = () => {
    if (filteredProducts.length === 0) {
      toast.error("No products to export!");
      return;
    }

    let csvContent = "\uFEFF"; 
    csvContent += "ID,Name,Category,SKU,Stock,Price,Status,Created At\n";

    filteredProducts.forEach(p => {
      const status = p.isActive ? "Active" : "Inactive";
      const formattedDate = new Date(p.createdAt).toLocaleDateString();
      csvContent += `"'${p.id}","${p.name}","${p.category}","${p.sku}",${p.stock},${p.price},"${status}","'${formattedDate}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "products_export.csv"; 
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setIsExportOpen(false);
    toast.success("Excel file downloaded successfully!");
  };

  // --- FIXED PDF EXPORT ---
  const exportToPDF = () => {
    if (filteredProducts.length === 0) {
      toast.error("No products to export!");
      return;
    }

    let htmlContent = `
      <html>
        <head>
          <title>Product Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #C3110C; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #C3110C; color: white; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Product Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Price (NGN)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    filteredProducts.forEach((p, index) => {
      const status = p.isActive ? "Active" : "Inactive";
      const formattedPrice = Number(p.price).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td>${p.category}</td>
          <td>${p.sku}</td>
          <td>${p.stock}</td>
          <td>${formattedPrice}</td>
          <td>${status}</td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
          </table>
          <div class="footer">This is a system-generated report from Onasis Admin.</div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "products_report.pdf"; 
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExportOpen(false);
    toast.success("PDF downloaded successfully!");
  };

  // --- BROWSER PRINT PREVIEW ---
  const handlePrint = () => {
    if (filteredProducts.length === 0) {
      toast.error("No products to print!");
      return;
    }
    window.print();
    setIsExportOpen(false);
  };
  // -------------------------

  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => counts[p.category] = (counts[p.category] || 0) + 1);
    return counts;
  }, [products]);

  const getStockColor = (stock) => {
    if (stock === 0) return isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700';
    if (stock < 10) return isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700';
    return isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700';
  };

  const columns = [
    { key: "rowNumber", label: "#" },
    { key: "name", label: "Product", render: (row) => (
      <div>
        <button onClick={() => navigate(`/dashboard/products/${row.id}`)} className={`text-sm font-medium text-left underline-offset-2 hover:underline cursor-pointer ${isDark ? 'text-white hover:text-[#C3110C]' : 'text-gray-900 hover:text-[#C3110C]'}`}>{row.name}</button>
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Supplier: {row.supplier}</div>
      </div>
    )},
    { key: "category", label: "Category", render: (row) => <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{row.category}</span> },
    { key: "sku", label: "SKU", render: (row) => <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{row.sku}</span> },
    { 
      key: "stock", 
      label: "Stock", 
      render: (row) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStockColor(row.stock)}`}>
          {/* SHOW X INSTEAD OF CHECK IF STOCK IS 0 */}
          {row.stock > 0 ? <CheckIcon className="w-3 h-3" /> : <XIcon className="w-3 h-3" />} {row.stock}
        </span>
      )
    },
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openModal('edit', row.id, row.name)} className={`cursor-pointer rounded-lg border p-2 transition ${isDark ? 'border-gray-600 text-gray-300 hover:border-[#C3110C]' : 'border-gray-200 text-gray-600 hover:border-[#C3110C]'}`}>
          <PencilIcon className="w-4 h-4" />
        </button>
        <button onClick={() => openModal('delete', row.id, row.name)} className={`cursor-pointer rounded-lg border p-2 transition ${isDark ? 'border-gray-600 text-gray-300 hover:border-red-500' : 'border-gray-200 text-gray-600 hover:border-red-500'}`}>
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    )},
  ];

  const processedData = paginatedProducts.map((item, index) => ({
    ...item,
    rowNumber: startIndex + index + 1, 
  }));

  return (
    <div className={`relative z-10 min-h-screen p-6 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {modalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-xl border p-6 shadow-2xl transition-colors ${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
            <h2 className="text-xl font-bold mb-2">{modalData.type === 'delete' ? 'Delete Product' : 'Edit Product'}</h2>
            <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {modalData.type === 'delete' ? `Are you sure you want to delete "${modalData.name}"? This action cannot be undone.` : `You are about to edit "${modalData.name}".`}
            </p>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reason for {modalData.type === 'delete' ? 'deletion' : 'edit'} <span className="text-red-500">*</span></label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#C3110C] mb-4 ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'}`} rows="3" placeholder="Enter your reason..." />
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className={`px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-100 transition ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
              <button onClick={confirmAction} className="px-4 py-2 text-sm font-medium rounded-lg bg-[#C3110C] text-white hover:bg-[#740A03] transition">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Products</h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your product catalog</p>
        </div>
        <button onClick={() => navigate("/dashboard/products/add")} className="cursor-pointer rounded-lg bg-[#C3110C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#740A03]">+ Add Product</button>
      </div>

      <div className={`mb-6 rounded-xl border p-4 shadow-sm transition-colors duration-300 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon className="w-5 h-5" />
            </span>
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search products..." className={`w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none transition focus:border-[#C3110C] ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'}`} />
          </div>
          
          <select value={category} onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }} className={`rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-600'}`}>
            <option>All Categories</option>
            {categoriesList.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          
          <div className="flex gap-2">
            {/* --- FILTER DROPDOWN --- */}
            <div className="relative" ref={filterDropdownRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border cursor-pointer transition ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Filter {dateFilter ? '(Active)' : '▼'}
              </button>
              {isFilterOpen && (
                <div className={`absolute top-12 left-0 z-50 w-48 rounded-lg border shadow-xl transition-colors ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                  <div className="p-2 flex flex-col gap-1">
                    <button onClick={() => { setDateFilter(""); setIsFilterOpen(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-sm rounded transition ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>Clear Filters</button>
                    <div className={`h-px my-1 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                    <button onClick={() => { setDateFilter("today"); setIsFilterOpen(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-sm rounded transition ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>Today</button>
                    <button onClick={() => { setDateFilter("week"); setIsFilterOpen(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-sm rounded transition ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>This Week</button>
                    <button onClick={() => { setDateFilter("month"); setIsFilterOpen(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-sm rounded transition ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>This Month</button>
                    <button onClick={() => { setDateFilter("year"); setIsFilterOpen(false); setCurrentPage(1); }} className={`w-full text-left px-3 py-2 text-sm rounded transition ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>This Year</button>
                  </div>
                </div>
              )}
            </div>

            {/* --- EXPORT DROPDOWN --- */}
            <div className="relative" ref={exportDropdownRef}>
              <button 
                onClick={() => setIsExportOpen(!isExportOpen)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border cursor-pointer transition ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Export ▼
              </button>
              {isExportOpen && (
                <div className={`absolute top-12 right-0 z-50 w-40 rounded-lg border shadow-xl transition-colors ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                  <div className="p-2 flex flex-col gap-1">
                    <button onClick={exportToExcel} className={`w-full text-left px-3 py-2 text-sm rounded transition ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>📊 Export Excel</button>
                    <button onClick={exportToPDF} className={`w-full text-left px-3 py-2 text-sm rounded transition ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>📄 Export PDF</button>
                    <button onClick={handlePrint} className={`w-full text-left px-3 py-2 text-sm rounded transition ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>🖨️ Print Preview</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button 
          onClick={() => { setCategory("All Categories"); setCurrentPage(1); }} 
          className={`rounded-lg border px-4 py-2 text-sm shadow-sm transition cursor-pointer ${category === "All Categories" ? "border-[#C3110C] ring-1 ring-[#C3110C]" : isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
        >
          <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>All Products</span> 
          <span className={`font-bold ml-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{products.length}</span>
        </button>

        {Object.entries(categoryCounts).map(([name, count]) => (
          <button 
            key={name} 
            onClick={() => { setCategory(name); setCurrentPage(1); }} 
            className={`rounded-lg border px-4 py-2 text-sm shadow-sm transition cursor-pointer ${category === name ? "border-[#C3110C] ring-1 ring-[#C3110C]" : isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
          >
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{name}</span>
            <span className={`font-bold ml-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{count}</span>
          </button>
        ))}
      </div>

      <DataTable 
        columns={columns} 
        data={processedData} 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
        itemsPerPage={productsPerPage} 
        totalItems={filteredProducts.length} 
        startIndex={startIndex} 
      />
    </div>
  );
};

export default Products;