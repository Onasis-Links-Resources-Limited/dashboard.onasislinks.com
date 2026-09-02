import { useState, useRef, useEffect } from "react";
import {
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  File,
} from "lucide-react";
import {
  downloadProformaCSV,
  downloadProformaPDF,
  downloadProformaDOCX,
} from "./proformaUtils";
import { useToast } from "../../context/ToastContext";

const FORMATS = [
  { key: "pdf", label: "PDF", icon: FileText },
  { key: "docx", label: "Word (.docx)", icon: File },
  { key: "csv", label: "CSV", icon: FileSpreadsheet },
];

/**
 * "Download ▾" button offering the Proforma Invoice in PDF, DOCX, or CSV.
 * PDF/DOCX generation is async (fetches the letterhead logo), so each
 * option shows its own loading state.
 */
const QuoteDownloadMenu = ({ quote, disabled = false, label = "Download" }) => {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(null); // 'pdf' | 'docx' | 'csv' | null
  const ref = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownload = async (format) => {
    setGenerating(format);
    try {
      if (format === "csv") {
        downloadProformaCSV(quote);
      } else if (format === "pdf") {
        await downloadProformaPDF(quote);
      } else if (format === "docx") {
        await downloadProformaDOCX(quote);
      }
      toast.success(`Proforma Invoice downloaded as ${format.toUpperCase()}.`);
      setOpen(false);
    } catch {
      toast.error(`Failed to generate ${format.toUpperCase()}.`);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
          {FORMATS.map(({ key, label: fLabel, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleDownload(key)}
              disabled={!!generating}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors disabled:opacity-50"
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
