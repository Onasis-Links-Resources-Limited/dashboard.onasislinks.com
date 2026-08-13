import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const CategoryForm = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!name) return alert("Please enter a category name.");
    const existing = JSON.parse(localStorage.getItem("categories") || "[]");
    const newCategory = {
      id: `CAT-${String(existing.length + 1).padStart(3, '0')}`,
      name,
      productCount: 0,
      isActive
    };
    localStorage.setItem("categories", JSON.stringify([...existing, newCategory]));
    alert("Category added!");
    navigate("/dashboard/categories");
  };

  return (
    <div className={`relative z-10 min-h-screen p-6 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate("/dashboard/categories")} className={`text-sm font-medium transition hover:text-[#C3110C] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>← Back</button>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add New Category</h1>
      </div>

      <div className={`max-w-2xl rounded-xl border p-6 shadow-sm ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`} />
          </div>
          <div className="mb-6 flex items-center gap-4">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Active</span>
            <button type="button" onClick={() => setIsActive(!isActive)} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isActive ? 'bg-[#C3110C]' : 'bg-gray-200 dark:bg-gray-600'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-[#C3110C] px-5 py-3 text-sm font-semibold text-white rounded-lg hover:bg-[#740A03]">Save Category</button>
            <button type="button" onClick={() => navigate("/dashboard/categories")} className={`px-5 py-3 text-sm font-medium rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;