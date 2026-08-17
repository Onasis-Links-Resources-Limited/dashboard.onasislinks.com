/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { RotateCcw, Save } from "lucide-react";
import {
  useSettingsStore,
  DEFAULT_COMPANY,
} from "../../../store/settingStore.js";

const inputClasses =
  "w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm px-3 py-2 focus:ring-2 focus:ring-[#C3110C] focus:border-transparent outline-none transition";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
      {label}
    </label>
    {children}
  </div>
);

const Card = ({ title, description, children }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
      {title}
    </h2>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-4">
      {description}
    </p>
    {children}
  </div>
);

/**
 * These fields are the source of truth for whatever generates the Proforma
 * Invoice (PDF/DOCX/CSV) — read them from useSettingsStore() there instead
 * of hardcoding company/VAT/bank details in that code.
 */
const CompanySettings = () => {
  const stored = useSettingsStore((s) => s.company);
  const updateCompany = useSettingsStore((s) => s.updateCompany);
  const updateCompanyBank = useSettingsStore((s) => s.updateCompanyBank);
  const resetCompany = useSettingsStore((s) => s.resetCompany);

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
  const setBank = (field, value) => {
    setForm((f) => ({ ...f, bank: { ...f.bank, [field]: value } }));
    setDirty(true);
  };

  const handleSave = () => {
    updateCompany(form);
    updateCompanyBank(form.bank);
    setDirty(false);
    toast.success("Company & invoicing settings saved.");
  };

  const handleReset = () => {
    resetCompany();
    setForm(DEFAULT_COMPANY);
    setDirty(false);
    toast("Reverted to default company settings.");
  };

  return (
    <div className="space-y-6">
      <Card
        title="Company Details"
        description="Appears on the letterhead of every generated Proforma Invoice."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Company Name">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClasses}
            />
          </Field>
          <Field label="RC Number">
            <input
              value={form.rcNumber}
              onChange={(e) => set("rcNumber", e.target.value)}
              className={inputClasses}
            />
          </Field>
          <Field label="Address">
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className={inputClasses}
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.tel}
              onChange={(e) => set("tel", e.target.value)}
              className={inputClasses}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClasses}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Tax & VAT"
        description="Used to calculate every quote's VAT and shown on the invoice."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="VAT Rate (%)">
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.vatRate}
              onChange={(e) => set("vatRate", Number(e.target.value))}
              className={inputClasses}
            />
          </Field>
          <Field label="Tax ID">
            <input
              value={form.taxId}
              onChange={(e) => set("taxId", e.target.value)}
              className={inputClasses}
            />
          </Field>
          <Field label="VAT No.">
            <input
              value={form.vatNo}
              onChange={(e) => set("vatNo", e.target.value)}
              className={inputClasses}
            />
          </Field>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
          Changing the VAT rate only affects proforma invoices generated after
          this change — existing quotes keep the rate they were priced at.
        </p>
      </Card>

      <Card
        title="Bank Details"
        description="Shown on every Proforma Invoice so clients know where to pay."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Bank Name">
            <input
              value={form.bank.bankerName}
              onChange={(e) => setBank("bankerName", e.target.value)}
              className={inputClasses}
            />
          </Field>
          <Field label="Account Name">
            <input
              value={form.bank.accountName}
              onChange={(e) => setBank("accountName", e.target.value)}
              className={inputClasses}
            />
          </Field>
          <Field label="Account Number">
            <input
              value={form.bank.accountNumber}
              onChange={(e) => setBank("accountNumber", e.target.value)}
              className={inputClasses}
            />
          </Field>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
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

export default CompanySettings;
