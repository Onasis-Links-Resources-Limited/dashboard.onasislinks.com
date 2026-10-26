import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, FileJson, Download, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const TEMPLATE_JSON = [
  {
    name: "Optical Transceiver 10G",
    sku: "OPT-10G-001",
    description: "10G SFP+ transceiver, 10km reach, singlemode.",
    stock_quantity: 100,
    status: "active",
    category_slug: "fibre-optics",
    image_url: "https://example.com/image.jpg",
    specifications: [
      { key: "Speed", value: "10Gbps" },
      { key: "Range", value: "10km" },
    ],
    datasheets: [
      { name: "Datasheet", url: "https://example.com/datasheet.pdf" },
    ],
  },
];

const BulkProductUpload = ({ open, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  // const token = localStorage.getItem("token");

  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const reset = () => {
    setRows([]);
    setFileName("");
    setParseError(null);
    setValidationErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose();
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([JSON.stringify(TEMPLATE_JSON, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file) => {
    setParseError(null);
    setValidationErrors([]);
    setFileName(file.name);

    if (!file.name.endsWith(".json")) {
      setParseError("Please upload a .json file.");
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // Accept either an array or { products: [...] }
      const list = Array.isArray(parsed) ? parsed : parsed.products;

      if (!Array.isArray(list) || list.length === 0) {
        setParseError("File must contain a JSON array of products.");
        return;
      }

      setRows(list);
    } catch (err) {
      setParseError("Invalid JSON: " + err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (rows.length === 0) return;
    setUploading(true);
    setValidationErrors([]);

    try {
      const result = await api.products.bulkCreate(rows);
      toast.success(result.message || `${rows.length} products created.`);
      onSuccess?.();
      reset();
      onClose();
    } catch (err) {
      const body = err.body || {};
      if (Array.isArray(body.errors) && body.errors.length > 0) {
        setValidationErrors(body.errors);
        toast.error(body.message || "Validation failed. See errors below.");
      } else {
        toast.error(err.message || "Bulk upload failed.");
      }
    } finally {
      setUploading(false);
    }
  };

//   const inputClasses = `w-full border rounded-lg text-sm px-3 py-2 ${
//     isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-200 bg-white text-gray-900"
//   }`;

  return createPortal(
    <div
      className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-xl border overflow-hidden ${
          isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-100"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-[#2A2A2A]" : "border-gray-100"}`}>
          <div>
            <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Bulk Upload Products
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Upload a JSON file containing an array of products.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className={`p-1 rounded-md ${isDark ? "text-gray-400 hover:bg-[#2A2A2A]" : "text-gray-400 hover:bg-gray-100"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Template download */}
          <button
            onClick={handleDownloadTemplate}
            className={`flex items-center gap-2 text-xs font-medium ${
              isDark ? "text-[#E6501B] hover:text-orange-400" : "text-[#C3110C] hover:text-[#a80e0a]"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Download JSON template
          </button>

          {/* Drop zone */}
          <label
            htmlFor="bulk-file"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer block ${
              isDark ? "border-[#2A2A2A] hover:border-[#C3110C]" : "border-gray-300 hover:border-[#C3110C]"
            }`}
          >
            <input
              id="bulk-file"
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={uploading}
            />
            <FileJson className={`mx-auto mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`} size={36} />
            <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {fileName || "Click or drop a .json file"}
            </p>
            <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Max 500 products per upload
            </p>
          </label>

          {/* Parse errors */}
          {parseError && (
            <div className={`p-3 rounded-lg text-xs flex gap-2 ${isDark ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-700"}`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && validationErrors.length === 0 && (
            <div className={`p-3 rounded-lg text-xs flex gap-2 ${isDark ? "bg-green-900/20 text-green-300" : "bg-green-50 text-green-700"}`}>
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Parsed <strong>{rows.length}</strong> product{rows.length === 1 ? "" : "s"} ready to upload.
              </span>
            </div>
          )}

          {/* Validation errors from server */}
          {validationErrors.length > 0 && (
            <div className={`rounded-lg border overflow-hidden ${isDark ? "border-red-900/50" : "border-red-200"}`}>
              <div className={`px-3 py-2 text-xs font-semibold ${isDark ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-700"}`}>
                {validationErrors.length} validation error{validationErrors.length === 1 ? "" : "s"} — nothing was uploaded
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                {validationErrors.map((e, i) => (
                  <div key={i} className={`px-3 py-2 text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    <strong>Row {e.row}:</strong> {e.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-2 px-5 py-4 border-t ${isDark ? "border-[#2A2A2A] bg-[#212121]" : "border-gray-100 bg-gray-50"}`}>
          <button
            onClick={handleClose}
            disabled={uploading}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isDark ? "text-gray-300 hover:bg-[#2A2A2A]" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || rows.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading…" : `Upload ${rows.length || ""} Product${rows.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BulkProductUpload;