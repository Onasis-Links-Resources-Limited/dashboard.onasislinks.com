import { useState, useRef, useEffect } from "react";
import {
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api.js";

const FORMATS = [
  { key: "pdf", label: "PDF", icon: FileText },
  { key: "csv", label: "CSV", icon: FileSpreadsheet },
];

const QuoteDownloadMenu = ({ quote, disabled = false, label = "Download" }) => {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(null);
  const ref = useRef(null);
  const { toast } = useToast();

  // ✅ Use the SAME key your axios client / auth flow uses.
  //    If your app stores it under 'token', keep that; otherwise import STORAGE_KEYS.
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownload = async (format) => {
    if (!token) {
      toast.error("Your session expired. Please sign in again.");
      return;
    }

    if (!quote?.id) {
      toast.error("This quote has no ID — cannot download.");
      return;
    }

    setGenerating(format);
    // ✅ Tell the user something is happening
    const loadingToastId = toast.loading?.(
      `Generating ${format.toUpperCase()}…`,
    );

    try {
      const blob = await api.quotes.downloadProforma(token, quote.id, format);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Proforma-${quote.proforma?.number || quote.id}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (loadingToastId) toast.dismiss?.(loadingToastId);
      toast.success(`Proforma Invoice downloaded as ${format.toUpperCase()}.`);
      setOpen(false);
    } catch (err) {
      if (loadingToastId) toast.dismiss?.(loadingToastId);
      // ✅ Surface the real server / network message
      const message =
        err?.message === "Failed to fetch"
          ? "Network error — check your connection and try again."
          : err?.message || `Failed to generate ${format.toUpperCase()}.`;
      toast.error(message);
      console.error("Proforma download error:", err);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || !!generating}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#212121] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <span className="w-4 h-4 border-2 border-gray-300 border-t-[#C3110C] rounded-full animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {generating
          ? `Generating ${generating.toUpperCase()}…`
          : label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
          {FORMATS.map(({ key, label: fLabel, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleDownload(key)}
              disabled={!!generating}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#212121] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating === key ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-[#C3110C] rounded-full animate-spin shrink-0" />
              ) : (
                <Icon className="w-4 h-4 shrink-0" />
              )}
              {fLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuoteDownloadMenu;