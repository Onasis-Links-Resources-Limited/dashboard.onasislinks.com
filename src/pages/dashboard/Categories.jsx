import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import DataTable from "../../components/common/DataTable";
import toast from 'react-hot-toast';
import { SearchIcon, TrashIcon, PencilIcon } from "../../components/common/Icons";

const Categories = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalData, setModalData] = useState({ isOpen: false, type: '', id: null, name: '' });
  const [reason, setReason] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryActive, setNewCategoryActive] = useState(true);

  const defaultCategories = [
    { id: "CAT-001", name: "Fiber Optic Networks", productCount: 23, isActive: true },
    { id: "CAT-002", name: "5G Technology", productCount: 12, isActive: true },
    { id: "CAT-003", name: "Cloud Solutions", productCount: 8, isActive: true },
    { id: "CAT-004", name: "Cybersecurity", productCount: 15, isActive: true },
    { id: "CAT-005", name: "Satellite Communication", productCount: 6, isActive: true },
    { id: "CAT-006", name: "IoT Solutions", productCount: 9, isActive: true },
  ];

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("categories");
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  useEffect(() => { localStorage.setItem("categories", JSON.stringify(categories)); }, [categories]);

  // --- FORCE RESET PAGE TO 1 ON LOAD ---
  useEffect(() => {
    setCurrentPage(1);
  }, []);
  // -------------------------------------

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, categories]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  
  const startIndex = ((Number(currentPage) || 1) - 1) * itemsPerPage;
  const paginated = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

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
      setCategories(categories.filter((c) => String(c.id) !== String(id)));
      toast.success(`Deleted category "${name}" successfully!`);
    } else if (type === 'edit') {
      toast.success(`Proceeding to edit category "${name}".`);
    }
    closeModal();
  };

  const handleAddCategorySubmit = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    const existing = JSON.parse(localStorage.getItem("categories") || "[]");
    const newCategory = {
      id: `CAT-${String(existing.length + 1).padStart(3, '0')}`,
      name: newCategoryName,
      productCount: 0,
      isActive: newCategoryActive
    };
    setCategories([...categories, newCategory]);
    setNewCategoryName("");
    setNewCategoryActive(true);
    setIsAddModalOpen(false);
    toast.success(`Category "${newCategoryName}" added successfully!`);
  };

  // --- THE PERMANENT FIX ---
  // Change key to "rowNumber". No render function needed.
  const columns = [
    { key: "rowNumber", label: "#" },
    { key: "name", label: "Category Name", render: (row) => <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{row.name}</span> },
    { key: "products", label: "Products", render: (row) => <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{row.productCount}</span> },
    { key: "actions", label: "Actions", render: (row) => (
      <div className="flex gap-2">
        <button onClick={() => openModal('edit', row.id, row.name)} className={`rounded-lg border p-2 transition cursor-pointer ${isDark ? 'border-gray-600 text-gray-300 hover:border-[#C3110C]' : 'border-gray-200 text-gray-600 hover:border-[#C3110C]'}`}>
          <PencilIcon className="w-4 h-4" />
        </button>
        <button onClick={() => openModal('delete', row.id, row.name)} className={`rounded-lg border p-2 transition cursor-pointer ${isDark ? 'border-gray-600 text-gray-300 hover:border-red-500' : 'border-gray-200 text-gray-600 hover:border-red-500'}`}>
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    )}
  ];

  // --- INJECT CLEAN NUMBERS INTO DATA ---
  const processedData = paginated.map((item, index) => ({
    ...item,
    rowNumber: startIndex + index + 1,
  }));
  // --------------------------------------

  return (
    <div className={`relative z-10 min-h-screen p-6 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* ACTION MODAL */}
      {modalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-xl border p-6 shadow-2xl transition-colors ${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
            <h2 className="text-xl font-bold mb-2">{modalData.type === 'delete' ? 'Delete Category' : 'Edit Category'}</h2>
            <p className={`mb-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {modalData.type === 'delete' ? `Are you sure you want to delete "${modalData.name}"?` : `You are about to edit "${modalData.name}".`}
            </p>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reason <span className="text-red-500">*</span></label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#C3110C] mb-4 ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'}`} rows="3" placeholder="Enter your reason..." />
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className={`px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-100 transition ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
              <button onClick={confirmAction} className="px-4 py-2 text-sm font-medium rounded-lg bg-[#C3110C] text-white hover:bg-[#740A03] transition">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-xl border p-6 shadow-2xl transition-colors ${isDark ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-200 bg-white text-gray-900'}`}>
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category Name *</label>
            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#C3110C] mb-4 ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`} placeholder="Enter category name" />
            <div className="flex items-center gap-4 mb-6">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Active</span>
              <button type="button" onClick={() => setNewCategoryActive(!newCategoryActive)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${newCategoryActive ? 'bg-[#C3110C]' : 'bg-gray-200 dark:bg-gray-600'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${newCategoryActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className={`px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-100 transition ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700'}`}>Cancel</button>
              <button onClick={handleAddCategorySubmit} className="px-4 py-2 text-sm font-medium rounded-lg bg-[#C3110C] text-white hover:bg-[#740A03] transition">Add Category</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Categories</h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Organize your products</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="rounded-lg bg-[#C3110C] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#740A03] cursor-pointer">+ Add Category</button>
      </div>

      <div className={`mb-6 rounded-xl border p-4 shadow-sm ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon className="w-5 h-5" />
          </span>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search categories..." className={`w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none focus:border-[#C3110C] ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`} />
        </div>
      </div>

      {/* PASS THE PROCESSED DATA */}
      <DataTable 
        columns={columns} 
        data={processedData} 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
        itemsPerPage={itemsPerPage} 
        totalItems={filteredCategories.length} 
        startIndex={startIndex} 
      />
    </div>
  );
};

export default Categories;