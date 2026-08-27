/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Info, Loader2 } from "lucide-react";
import { useSettingsStore } from "../../../store/settingsStore.js";
import { useTheme } from "../../../context/ThemeContext";

const NotificationSettings = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const stored = useSettingsStore((s) => s.notifications);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const loading = useSettingsStore((s) => s.loading);

  const [form, setForm] = useState(stored);
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateNotifications(form);
    if (success) {
      toast.success("Notification settings saved!");
    } else {
      toast.error("Failed to save notifications.");
    }
    setIsSaving(false);
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C3110C]" /></div>;

  const inputClasses = `w-full border rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition ${isDark ? "border-[#2A2A2A] bg-[#1A1A1A] text-white" : "border-gray-200 bg-white text-gray-900"}`;
  const cardClasses = `rounded-xl p-5 border shadow-sm ${isDark ? "bg-[#1A1A1A] border-[#2A2A2A]" : "bg-white border-gray-200"}`;

  return (
    <div className="space-y-6">
      <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${isDark ? "bg-blue-900/20 text-blue-300" : "bg-blue-50 text-blue-700"}`}>
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>These preferences are stored and will be used when email integration is connected.</span>
      </div>

      <div className={cardClasses}>
        <h2 className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Internal Alerts</h2>
        <p className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Notify your team when activity happens.</p>
        <div className="space-y-3">
          <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
            <span>
              <span className={`block text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>New quote request received</span>
              <span className={`block text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Alert staff when a client submits a request.</span>
            </span>
            <span className="relative inline-flex flex-shrink-0 items-center">
              <input type="checkbox" checked={form.notifyOnNewQuoteRequest} onChange={(e) => set("notifyOnNewQuoteRequest", e.target.checked)} className="sr-only peer" />
              <span className={`w-10 h-6 rounded-full peer-checked:bg-[#C3110C] transition-colors ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
              <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </span>
          </label>

          <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
            <span>
              <span className={`block text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>Purchase Order recorded</span>
              <span className={`block text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Alert staff when an order is confirmed.</span>
            </span>
            <span className="relative inline-flex flex-shrink-0 items-center">
              <input type="checkbox" checked={form.notifyOnPurchaseOrder} onChange={(e) => set("notifyOnPurchaseOrder", e.target.checked)} className="sr-only peer" />
              <span className={`w-10 h-6 rounded-full peer-checked:bg-[#C3110C] transition-colors ${isDark ? "bg-[#2A2A2A]" : "bg-gray-200"}`} />
              <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </span>
          </label>
        </div>
      </div>

      <div className={`${cardClasses} space-y-4`}>
        <div>
          <h2 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Client Email Template</h2>
          <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Sent to the client along with the Proforma Invoice PDF.</p>
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>Subject line <span className="text-gray-400">— use {"{proformaNumber}"} as a placeholder</span></label>
          <input value={form.proformaEmailSubject} onChange={(e) => set("proformaEmailSubject", e.target.value)} className={inputClasses} />
        </div>
        <div>
          <label className={`block text-xs font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>Internal notification recipients</label>
          <input value={form.internalNotifyEmails} onChange={(e) => set("internalNotifyEmails", e.target.value)} placeholder="sales@onasisltd.com, manager@onasisltd.com" className={inputClasses} />
          <p className="text-xs text-gray-400 mt-1">Comma-separated email addresses.</p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button onClick={handleSave} disabled={!dirty || isSaving} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] transition-colors disabled:opacity-50`}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;