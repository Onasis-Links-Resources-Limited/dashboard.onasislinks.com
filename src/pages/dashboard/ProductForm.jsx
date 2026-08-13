import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import toast from 'react-hot-toast';

const ProductForm = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  const isEditMode = id && id !== 'add'; 

  const [formErrors, setFormErrors] = useState({ name: '', category: '', sku: '', stock: '', image: '' });

  const [formData, setFormData] = useState({
    name: "", description: "", category: "", sku: "", unit: "piece", minOrder: 1, 
    stock: 0, price: 0, isActive: true,
    imagePreview: null,
    specs: [{ name: "Brand", value: "" }, { name: "Model", value: "" }],
    downloads: [{ name: "Datasheet.pdf" }, { name: "Installation Guide.pdf" }]
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isEditMode) {
      try {
        let stored = JSON.parse(localStorage.getItem("products") || "[]");
        let foundIndex = stored.findIndex((p) => String(p.id) === String(id));
        
        if (foundIndex !== -1) {
          let found = stored[foundIndex];
          const urlParams = new URLSearchParams(window.location.search);
          const reason = urlParams.get('reason');

          let safeStock = 0;
          let safePrice = 0;
          let safeMinOrder = 1;

          if (found.stock !== undefined && !isNaN(Number(found.stock))) {
            safeStock = Number(found.stock);
          }
          if (found.price !== undefined && !isNaN(Number(found.price))) {
            safePrice = Number(found.price);
          }
          if (found.minOrder !== undefined && !isNaN(Number(found.minOrder))) {
            safeMinOrder = Number(found.minOrder);
          }
          
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setFormData({
            ...found,
            stock: safeStock,     
            price: safePrice,
            minOrder: safeMinOrder,
            specs: Array.isArray(found.specs) ? found.specs : [],
            downloads: Array.isArray(found.downloads) ? found.downloads : [],
          });

          stored[foundIndex] = {
            ...found,
            stock: safeStock,
            price: safePrice,
            minOrder: safeMinOrder
          };
          localStorage.setItem("products", JSON.stringify(stored));

          if (reason) {
            toast.success(`Editing product. Reason provided: ${reason}`);
          }
        } else {
          toast.error("Product not found!");
          window.location.href = "/dashboard/products";
        }
      } catch (error) {
        console.error(error);
      }
    }
    setLoading(false);
  }, [id, isEditMode]);

  const preventNegative = (e) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const finalValue = (type === 'number' && value === '') ? '' : value;

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specs];
    newSpecs[index][field] = value;
    setFormData(prev => ({ ...prev, specs: newSpecs }));
  };

  const addSpec = () => setFormData(prev => ({ ...prev, specs: [...prev.specs, { name: "", value: "" }] }));

  const removeSpec = (index) => {
    const newSpecs = formData.specs.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, specs: newSpecs }));
  };

  const removeFile = (index) => {
    const newDownloads = formData.downloads.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, downloads: newDownloads }));
  };

  const handleImageClick = () => imageInputRef.current?.click();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imagePreview: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleFileClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        downloads: [...prev.downloads, { name: file.name }] 
      }));
    }
  };

  // --- UPDATED SAVE LOGIC ---
  const handleSubmit = (e) => {
    e.preventDefault();

    let errors = { name: '', category: '', sku: '', stock: '', image: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Product Name is required.";
      isValid = false;
    }
    if (!formData.category) {
      errors.category = "Please select a Category.";
      isValid = false;
    }
    if (!formData.sku.trim()) {
      errors.sku = "SKU is required.";
      isValid = false;
    }

    // --- NEW VALIDATION CHECKS ---
    // 1. Image is required
    if (!formData.imagePreview) {
      errors.image = "Product Image is required.";
      isValid = false;
    }

    // 2. Stock must be at least 1
    const currentStock = Number(formData.stock) || 0;
    if (currentStock < 1) {
      errors.stock = "Stock Quantity must be at least 1.";
      isValid = false;
    }
    // ----------------------------

    if (!isValid) {
      setFormErrors(errors);
      toast.error("Please fix the errors highlighted below.");
      return;
    }

    const safeStock = Number(formData.stock) || 1;
    const safePrice = Number(formData.price) || 0;
    const safeMinOrder = Number(formData.minOrder) || 1;

    const stored = JSON.parse(localStorage.getItem("products") || "[]");
    let updatedProducts;

    if (isEditMode) {
      updatedProducts = stored.map((p) => 
        String(p.id) === String(id) ? { 
          ...formData, 
          stock: safeStock, 
          price: safePrice, 
          minOrder: safeMinOrder 
        } : p
      );
      toast.success("Product updated successfully!");
    } else {
      const nextId = `PRD-${String(Number(stored.length) + 1).padStart(4, '0')}`;
      
      const newProduct = {
        id: nextId,
        ...formData,
        stock: safeStock, 
        price: safePrice, 
        minOrder: safeMinOrder,
        createdAt: new Date().toISOString()
      };
      updatedProducts = [...stored, newProduct];
      toast.success("Product added successfully!");
    }

    localStorage.setItem("products", JSON.stringify(updatedProducts));
    window.location.href = "/dashboard/products";
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading product data...</div>;
  }

  return (
    <div className={`relative z-10 min-h-screen p-6 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => window.location.href = "/dashboard/products"} className={`text-sm font-medium transition hover:text-[#C3110C] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>← Back</button>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isEditMode ? "Edit Product" : "Add New Product"}
            </h1>
            {isEditMode && <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Editing ID: {id}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.location.href = "/dashboard/products"} className={`px-5 py-3 text-sm font-medium rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Cancel</button>
          <button onClick={handleSubmit} className="cursor-pointer rounded-lg bg-[#C3110C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#740A03]">Save Changes</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-lg border p-6 shadow-sm ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Product Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${formErrors.name ? 'border-red-500' : ''} ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`} />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}></textarea>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Category <span className="text-red-500">*</span></label>
                <select name="category" value={formData.category} onChange={handleChange} className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${formErrors.category ? 'border-red-500' : ''} ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`}>
                  <option value="">Select Category</option>
                  <option value="RF Materials">RF Materials</option>
                  <option value="Power">Power</option>
                  <option value="Fiber Optical Materials">Fiber Optical Materials</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                  <option value="Network Materials">Network Materials</option>
                </select>
                {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>SKU <span className="text-red-500">*</span></label>
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${formErrors.sku ? 'border-red-500' : ''} ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`} />
                {formErrors.sku && <p className="text-red-500 text-xs mt-1">{formErrors.sku}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Price (₦)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Stock Quantity <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  name="stock" 
                  min="1"
                  value={formData.stock} 
                  onChange={handleChange} 
                  onKeyDown={preventNegative}
                  className={`w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${formErrors.stock ? 'border-red-500' : ''} ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'}`} 
                />
                {formErrors.stock && <p className="text-red-500 text-xs mt-1">{formErrors.stock}</p>}
              </div>
              <div className="md:col-span-2 flex items-center gap-4 mt-2">
                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Active Status</label>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${formData.isActive ? 'bg-[#C3110C]' : 'bg-gray-200 dark:bg-gray-600'}`}>
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{formData.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-lg border p-6 shadow-sm ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Product Image <span className="text-red-500">*</span></h2>
            <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
            <div onClick={handleImageClick} className={`border-2 border-dashed rounded-lg p-8 text-center transition hover:border-[#C3110C] cursor-pointer ${formErrors.image ? 'border-red-500' : ''} ${isDark ? 'border-gray-600 hover:border-[#C3110C]' : 'border-gray-300 hover:border-[#C3110C]'}`}>
              {formData.imagePreview ? (
                <img src={formData.imagePreview} alt="Product Preview" className="max-h-40 mx-auto object-contain rounded-md mb-2" />
              ) : (
                <>
                  <div className="text-4xl mb-2 text-gray-400">🖼️</div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Click or drag to upload</p>
                </>
              )}
            </div>
            {formErrors.image && <p className="text-red-500 text-xs mt-1">{formErrors.image}</p>}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className={`rounded-lg border p-6 shadow-sm ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Specifications</h2>
            {formData.specs.map((spec, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 mb-3">
                <input type="text" placeholder="Specification Name" value={spec.name} onChange={(e) => handleSpecChange(index, "name", e.target.value)} className={`flex-1 rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`} />
                <input type="text" placeholder="Value" value={spec.value} onChange={(e) => handleSpecChange(index, "value", e.target.value)} className={`flex-1 rounded-lg border px-4 py-2 text-sm outline-none focus:border-[#C3110C] ${isDark ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'}`} />
                <button type="button" onClick={() => removeSpec(index)} className={`px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition`}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addSpec} className={`mt-2 text-sm font-medium hover:text-[#C3110C] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>+ Add Specification</button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className={`rounded-lg border p-6 shadow-sm ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Downloads</h2>
            <div className="space-y-2 mb-4">
              {formData.downloads.map((file, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>📄 {file.name}</span>
                  <button type="button" onClick={() => removeFile(index)} className={`text-sm hover:text-red-500 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>✕</button>
                </div>
              ))}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button type="button" onClick={handleFileClick} className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>+ Upload File</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductForm;