import React from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeContext";

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
  onConfirm = () => {},
  onCancel = () => {},
}) => {
  const { theme } = useTheme();
  if (!open) return null;
  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${theme === "dark" ? "dark" : ""}`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded border">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${danger ? "bg-red-600" : "bg-[#C3110C]"}`}
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
