import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../libs/utils";

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
  onConfirm = () => {},
  onCancel = () => {},
  reason = "",
  onReasonChange = () => {},
  reasonPlaceholder = "Reason for action (optional)...",
  showReason = true,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
    >
      <div className={cn(
        "rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border",
        isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-100"
      )}>
        {/* Header */}
        <div className={cn(
          "px-6 py-4 border-b",
          isDark ? "border-[#2A2A2A]" : "border-gray-100",
          danger ? (isDark ? "bg-red-900/20" : "bg-red-50") : ""
        )}>
          <div className="flex items-center gap-3">
            {danger && (
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                isDark ? "bg-red-900/30" : "bg-red-100"
              )}>
                <svg className={cn("w-4 h-4", isDark ? "text-red-400" : "text-red-600")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
            <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>
              {title}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
            {description}
          </p>

          {/* ⭐ Reason Text Field */}
          {showReason && (
            <div className="space-y-1.5">
              <label className={cn("text-xs font-medium", isDark ? "text-gray-400" : "text-gray-600")}>
                Reason <span className="text-gray-400 dark:text-gray-500">(optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder={reasonPlaceholder}
                rows="2"
                className={cn(
                  "w-full px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition resize-none",
                  isDark
                    ? "bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                )}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          "px-6 py-4 border-t flex items-center justify-end gap-2",
          isDark ? "border-[#2A2A2A]" : "border-gray-100"
        )}>
          <button
            onClick={onCancel}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
              isDark ? "text-gray-300 hover:bg-[#2A2A2A]" : "text-gray-700 hover:bg-gray-100"
            )}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2",
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#C3110C] hover:bg-[#a80e0a]"
            )}
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;