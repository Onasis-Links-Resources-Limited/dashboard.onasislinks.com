import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Truck, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const UOM_OPTIONS = ["Unit", "PCS", "PAK", "M"];
const UOM_OTHER = "__other__";

const WaybillModal = ({ isOpen, onClose, quote, onGenerate, loading }) => {
  const { theme } = useTheme();
  if (!isOpen) return null;

  return (
    <WaybillModalContent
      onClose={onClose}
      quote={quote}
      onGenerate={onGenerate}
      loading={loading}
      isDark={theme === "dark"}
    />
  );
};

const WaybillModalContent = ({ onClose, quote, onGenerate, loading, isDark }) => {
  const [staffName, setStaffName] = useState("");
  const [items, setItems] = useState(() =>
    (quote?.items || []).map((item) => {
      const initialUnit = (item.unit || "").trim();
      const matched = UOM_OPTIONS.find(
        (u) => u.toLowerCase() === initialUnit.toLowerCase()
      );

      return {
        id: item.id,
        product_name: item.product_name || item.name,
        quantity: item.quantity,
        deliveredQty: item.quantity,
        remark: "OK",
        uom: matched || (initialUnit ? UOM_OTHER : "PCS"),
        customUom: matched ? "" : initialUnit,
      };
    })
  );

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    // Format the items to send to the backend
    const finalItems = items.map((item) => ({
      id: item.id,
      deliveredQty: Number(item.deliveredQty),
      remark: item.remark,
      unit: item.uom === UOM_OTHER ? item.customUom.trim() : item.uom,
    }));

    onGenerate({ staffName, items: finalItems });
  };

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50">
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl border ${
          isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"
        }`}
      >
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-[#2A2A2A]" : "border-gray-200"}`}>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C3110C]" />
            <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Generate Waybill
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Staff Name */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Dispatched By (Staff Name) *
            </label>
            <input
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="e.g. Ejere Stanley"
              className={`w-full px-3 py-2 rounded-lg border outline-none ${
                isDark ? "bg-[#212121] border-[#2A2A2A] text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden dark:border-[#2A2A2A]">
            <table className="w-full text-sm">
              <thead className={isDark ? "bg-[#212121]" : "bg-gray-50"}>
                <tr>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-center w-28">Units</th>
                  <th className="px-3 py-2 text-center w-16">Qty</th>
                  <th className="px-3 py-2 text-center w-24">Delivered</th>
                  <th className="px-3 py-2 text-center w-28">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#2A2A2A]">
                {items.map((item, index) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-3 py-3">{item.product_name}</td>
                    
                    {/* ✅ UOM Dropdown */}
                    <td className="px-3 py-3">
                      <select
                        value={item.uom}
                        onChange={(e) => handleItemChange(index, "uom", e.target.value)}
                        className={`w-full text-xs px-2 py-1.5 border rounded outline-none ${
                          isDark ? "bg-[#1A1A1A] border-[#3A3A3A] text-white" : "bg-white border-gray-300"
                        }`}
                      >
                        {UOM_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value={UOM_OTHER}>Other...</option>
                      </select>
                      {item.uom === UOM_OTHER && (
                        <input
                          type="text"
                          value={item.customUom}
                          onChange={(e) => handleItemChange(index, "customUom", e.target.value)}
                          placeholder="Custom UOM"
                          className={`w-full mt-1 px-2 py-1 border rounded text-xs ${
                            isDark ? "bg-[#1A1A1A] border-[#3A3A3A] text-white" : "bg-white border-gray-300"
                          }`}
                        />
                      )}
                    </td>

                    <td className="px-3 py-3 text-center">{item.quantity}</td>
                    
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={item.deliveredQty}
                        onChange={(e) => handleItemChange(index, "deliveredQty", e.target.value)}
                        className={`w-full text-center px-2 py-1 border rounded ${
                          isDark ? "bg-[#1A1A1A] border-[#3A3A3A] text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={item.remark}
                        onChange={(e) => handleItemChange(index, "remark", e.target.value)}
                        className={`w-full px-2 py-1 border rounded ${
                          isDark ? "bg-[#1A1A1A] border-[#3A3A3A] text-white" : "bg-white border-gray-300"
                        }`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={`p-4 border-t flex justify-end gap-2 ${isDark ? "border-[#2A2A2A] bg-[#212121]" : "border-gray-200 bg-gray-50"}`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? "text-gray-300 hover:bg-[#2A2A2A]" : "text-gray-700 hover:bg-gray-100"}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !staffName.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            Generate PDF
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default WaybillModal;