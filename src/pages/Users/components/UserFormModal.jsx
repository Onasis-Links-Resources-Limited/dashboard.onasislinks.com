import { useState } from "react";
import { createPortal } from "react-dom";
import { X, ShieldCheck } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { cn } from "../../../libs/utils";
import { ROLE_OPTIONS, ROLE_CONFIG, STATUS_OPTIONS } from "../constant";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  department: "",
  role: "viewer",
  status: "active",
};

const getInitialForm = (user) =>
  user
    ? {
        first_name: user.first_name || user.name?.split(" ")[0] || "",
        last_name: user.last_name || user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email,
        phone: user.phone || "",
        department: user.department || "",
        role: user.role || "viewer",
        status: user.status || "active",
      }
    : { ...EMPTY_FORM };

const UserFormModalContent = ({ open, user, onSave, onCancel }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [form, setForm] = useState(() => getInitialForm(user));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!user;

  if (!open) return null;

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.first_name.trim()) next.first_name = "First name is required.";
    if (!form.last_name.trim()) next.last_name = "Last name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Please enter a valid email.";
    if (!form.role) next.role = "Please select a role.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const modalInput = cn(
    "w-full border rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition",
    isDark
      ? "border-[#2A2A2A] bg-[#1A1A1A] text-white placeholder-gray-500"
      : "border-gray-200 bg-white text-gray-900 placeholder-gray-400"
  );

  return createPortal(
    <div
      className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && !saving && onCancel()}
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          "w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-xl border overflow-hidden",
          isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-100"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-5 py-4 border-b flex-shrink-0",
          isDark ? "border-[#2A2A2A]" : "border-gray-100"
        )}>
          <h2 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
            {isEdit ? "Edit User" : "New User"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Close"
            className={cn(
              "p-1 rounded-md disabled:opacity-40",
              isDark ? "text-gray-400 hover:bg-[#2A2A2A]" : "text-gray-400 hover:bg-gray-100"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className={cn(
          "overflow-y-auto p-5 space-y-4 flex-1",
          isDark ? "bg-[#1A1A1A]" : "bg-white"
        )}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={cn("block text-xs font-medium mb-1", isDark ? "text-gray-300" : "text-gray-600")}>
                First Name *
              </label>
              <input
                value={form.first_name}
                onChange={(e) => setField("first_name", e.target.value)}
                placeholder="John"
                className={cn(modalInput, errors.first_name && "border-red-400")}
              />
              {errors.first_name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label className={cn("block text-xs font-medium mb-1", isDark ? "text-gray-300" : "text-gray-600")}>
                Last Name *
              </label>
              <input
                value={form.last_name}
                onChange={(e) => setField("last_name", e.target.value)}
                placeholder="Doe"
                className={cn(modalInput, errors.last_name && "border-red-400")}
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.last_name}</p>
              )}
            </div>
          </div>

          <div>
            <label className={cn("block text-xs font-medium mb-1", isDark ? "text-gray-300" : "text-gray-600")}>
              Email Address *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="john@onasisltd.com"
              className={cn(modalInput, errors.email && "border-red-400")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={cn("block text-xs font-medium mb-1", isDark ? "text-gray-300" : "text-gray-600")}>
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+234 801 234 5678"
                className={modalInput}
              />
            </div>
            <div>
              <label className={cn("block text-xs font-medium mb-1", isDark ? "text-gray-300" : "text-gray-600")}>
                Department
              </label>
              <input
                value={form.department}
                onChange={(e) => setField("department", e.target.value)}
                placeholder="Management"
                className={modalInput}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={cn("block text-xs font-medium mb-1", isDark ? "text-gray-300" : "text-gray-600")}>
                Role *
              </label>
              <select
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                className={modalInput}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{ROLE_CONFIG[r]?.label || r}</option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.role}</p>
              )}
            </div>
            <div>
              <label className={cn("block text-xs font-medium mb-1", isDark ? "text-gray-300" : "text-gray-600")}>
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className={modalInput}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={cn(
            "flex items-start gap-2 p-3 rounded-lg text-xs",
            isDark ? "bg-[#242424] text-gray-400" : "bg-gray-50 text-gray-500"
          )}>
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Module-level permissions (read/write/delete/approve) are derived from the selected role.</span>
          </div>
        </div>

        {/* Footer */}
        <div className={cn(
          "flex items-center justify-end gap-2 px-5 py-4 border-t flex-shrink-0",
          isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-gray-50 border-gray-100"
        )}>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
              isDark ? "text-gray-300 hover:bg-[#2A2A2A]" : "text-gray-700 hover:bg-gray-100"
            )}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] transition-colors disabled:opacity-50"
          >
            {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {isEdit ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

const UserFormModal = (props) => {
  const { open, user } = props;
  return (
    <UserFormModalContent
      key={`${open}-${user?.id ?? "new"}`}
      {...props}
    />
  );
};

export default UserFormModal;