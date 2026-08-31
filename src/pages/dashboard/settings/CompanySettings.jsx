/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { RotateCcw, Save, Loader2 } from "lucide-react";
import { useSettingsStore, DEFAULT_COMPANY } from "../../../store/settingsStore.js";
import { useTheme } from "../../../context/ThemeContext";

const CompanySettingsSkeleton = ({ cardClasses, isDark }) => (
  <div className="space-y-6">
    <div className={cardClasses}>
      <div className={`h-5 w-32 rounded animate-pulse ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
      <div className={`h-3 w-48 rounded animate-pulse mt-1 mb-4 ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <div className={`h-3 w-20 rounded animate-pulse mb-1 ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
            <div className={`h-9 w-full rounded animate-pulse ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
          </div>
        ))}
      </div>
    </div>
    <div className={cardClasses}>
      <div className={`h-5 w-24 rounded animate-pulse ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
      <div className={`h-3 w-48 rounded animate-pulse mt-1 mb-4 ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className={`h-3 w-20 rounded animate-pulse mb-1 ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
            <div className={`h-9 w-full rounded animate-pulse ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
          </div>
        ))}
      </div>
    </div>
    <div className={cardClasses}>
      <div className={`h-5 w-24 rounded animate-pulse ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
      <div className={`h-3 w-48 rounded animate-pulse mt-1 mb-4 ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className={`h-3 w-20 rounded animate-pulse mb-1 ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
            <div className={`h-9 w-full rounded animate-pulse ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CompanySettings = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stored = useSettingsStore((s) => s.company);
  const updateCompany = useSettingsStore((s) => s.updateCompany);
  const resetCompany = useSettingsStore((s) => s.resetCompany);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const loading = useSettingsStore((s) => s.loading);

  const [form, setForm] = useState(stored);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Fetch on load
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setForm(stored);
    setDirty(false);
  }, [stored]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty(true);
  };
  const setBank = (field, value) => {
    setForm((f) => ({ ...f, bank: { ...f.bank, [field]: value } }));
    setDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateCompany(form);
    if (success) {
      toast.success("Company settings saved!");
    } else {
      toast.error("Failed to save company settings.");
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    resetCompany();
    setForm(DEFAULT_COMPANY);
    setDirty(false);
    toast("Reverted to default settings.");
  };

  const inputClasses = `w-full border rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-200 bg-white text-gray-900"}`;
  const cardClasses = `rounded-xl p-5 border shadow-sm ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`;
  const titleClasses = `text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`;
  const descClasses = `text-xs mt-0.5 mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`;
  const labelClasses = `block text-xs font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`;

  if (loading) return <CompanySettingsSkeleton cardClasses={cardClasses} isDark={isDark} />;

  return (
    <div className="space-y-6">
      <div className={cardClasses}>
        <h2 className={titleClasses}>Company Details</h2>
        <p className={descClasses}>Appears on the letterhead of every generated Proforma Invoice.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>Company Name</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>RC Number</label>
            <input value={form.rcNumber} onChange={(e) => set("rcNumber", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Address</label>
            <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Phone</label>
            <input value={form.tel} onChange={(e) => set("tel", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Email</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClasses} />
          </div>
        </div>
      </div>

      {/* Tax & VAT Card */}
      <div className={cardClasses}>
        <h2 className={titleClasses}>Tax & VAT</h2>
        <p className={descClasses}>Used to calculate every quote's VAT and shown on the invoice.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClasses}>VAT Rate (%)</label>
            <input type="number" min="0" step="0.1" value={form.vatRate} onChange={(e) => set("vatRate", Number(e.target.value))} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Tax ID</label>
            <input value={form.taxId} onChange={(e) => set("taxId", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>VAT No.</label>
            <input value={form.vatNo} onChange={(e) => set("vatNo", e.target.value)} className={inputClasses} />
          </div>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
          Changing the VAT rate only affects proforma invoices generated after this change.
        </p>
      </div>

      {/* Bank Card */}
      <div className={cardClasses}>
        <h2 className={titleClasses}>Bank Details</h2>
        <p className={descClasses}>Shown on every Proforma Invoice so clients know where to pay.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClasses}>Bank Name</label>
            <input value={form.bank.bankerName} onChange={(e) => setBank("bankerName", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Account Name</label>
            <input value={form.bank.accountName} onChange={(e) => setBank("accountName", e.target.value)} className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Account Number</label>
            <input value={form.bank.accountNumber} onChange={(e) => setBank("accountNumber", e.target.value)} className={inputClasses} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button onClick={handleReset} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isDark ? "text-gray-300 hover:bg-[#2A2A2A]" : "text-gray-600 hover:bg-gray-100"} transition-colors`}>
          <RotateCcw className="w-4 h-4" /> Reset to Defaults
        </button>
        <button onClick={handleSave} disabled={!dirty || isSaving} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] transition-colors disabled:opacity-50`}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
      </div>
    </div>
  );
};

export default CompanySettings;