/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save, Info } from "lucide-react";
import { useSettingsStore } from "../../../store/settingStore.js";
const inputClasses =
  "w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm px-3 py-2 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition";

const Toggle = ({ checked, onChange, label, description }) => (
  <label className="flex items-start justify-between gap-4 py-3 cursor-pointer">
    <span>
      <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">
        {label}
      </span>
      {description && (
        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </span>
      )}
    </span>
    <span className="relative inline-flex flex-shrink-0 items-center mt-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <span className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-[#C3110C] transition-colors" />
      <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
    </span>
  </label>
);

/**
 * Notification preferences. No email provider is connected yet, so these
 * are placeholders — saved now so the backend team can read them directly
 * once real email sending is wired up.
 */
const NotificationSettings = () => {
  const stored = useSettingsStore((s) => s.notifications);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);

  const [form, setForm] = useState(stored);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(stored);
    setDirty(false);
  }, [stored]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    updateNotifications(form);
    setDirty(false);
    toast.success("Notification settings saved.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          No email provider is connected yet, so these settings won&apos;t send
          real emails until the backend team wires one up. They&apos;re saved
          now so that work can pick up these preferences directly.
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Internal Alerts
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Notify your team when activity happens.
        </p>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <Toggle
            checked={form.notifyOnNewQuoteRequest}
            onChange={(v) => set("notifyOnNewQuoteRequest", v)}
            label="New quote request received"
            description="Alert staff when a client submits a request from the website."
          />
          <Toggle
            checked={form.notifyOnPurchaseOrder}
            onChange={(v) => set("notifyOnPurchaseOrder", v)}
            label="Purchase Order recorded"
            description="Alert staff when an order is confirmed and ready for delivery."
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Client Email Template
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sent to the client along with the Proforma Invoice PDF.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Subject line{" "}
            <span className="text-gray-400">
              — use {"{proformaNumber}"} as a placeholder
            </span>
          </label>
          <input
            value={form.proformaEmailSubject}
            onChange={(e) => set("proformaEmailSubject", e.target.value)}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Internal notification recipients
          </label>
          <input
            value={form.internalNotifyEmails}
            onChange={(e) => set("internalNotifyEmails", e.target.value)}
            placeholder="sales@onasisltd.com, manager@onasisltd.com"
            className={inputClasses}
          />
          <p className="text-xs text-gray-400 mt-1">
            Comma-separated email addresses.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={handleSave}
          disabled={!dirty}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#C3110C] text-white hover:bg-[#a80e0a] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
