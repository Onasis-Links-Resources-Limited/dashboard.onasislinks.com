import { create } from "zustand";
import { persist } from "zustand/middleware";

// Kept local to this file (rather than added to constants/config.js's
// STORAGE_KEYS) to avoid touching a shared file outside the settings
// module. Follows the same naming convention as the existing
// onasis_auth_token / onasis_theme keys.
const SETTINGS_STORAGE_KEY = "onasis_dashboard_settings";

// These values used to be (or currently are) hardcoded wherever the
// Proforma Invoice is generated. Centralizing them here means finance can
// update the VAT rate or bank details from the Settings page instead of
// needing a code change and redeploy.
export const DEFAULT_COMPANY = {
  name: "ONASIS LINKS RESOURCES LIMITED",
  address: "Plot 78A Eleganza Gardens, Lekki-Epe Expressway",
  tel: "+2348030495649",
  email: "info@onasisltd.com",
  rcNumber: "RC: 623670",
  taxId: "2522543594411",
  vatNo: "LC 06623670",
  vatRate: 7.5,
  bank: {
    bankerName: "Zenith Bank",
    accountName: "Onasis Links Resources Ltd",
    accountNumber: "1012552910",
  },
};

const DEFAULT_NOTIFICATIONS = {
  notifyOnNewQuoteRequest: true,
  notifyOnPurchaseOrder: true,
  proformaEmailSubject:
    "Proforma Invoice {proformaNumber} — Onasis Links Resources Limited",
  internalNotifyEmails: "sales@onasisltd.com",
};

/**
 * Dashboard-wide settings. Persisted to localStorage for now (pre-backend);
 * once a real /api/settings endpoint exists, swap the `persist` storage
 * for a fetch-on-load + save-on-change pattern, same shape as api/client.js.
 *
 * Role permissions are intentionally NOT stored here — they live in
 * src/constants/roles.js and are enforced by AuthContext.hasPermission(),
 * so this store never becomes a second, out-of-sync source of truth for
 * something security-relevant.
 */
export const useSettingsStore = create(
  persist(
    (set) => ({
      company: DEFAULT_COMPANY,
      notifications: DEFAULT_NOTIFICATIONS,

      updateCompany: (patch) =>
        set((state) => ({ company: { ...state.company, ...patch } })),
      updateCompanyBank: (patch) =>
        set((state) => ({
          company: {
            ...state.company,
            bank: { ...state.company.bank, ...patch },
          },
        })),
      resetCompany: () => set({ company: DEFAULT_COMPANY }),

      updateNotifications: (patch) =>
        set((state) => ({
          notifications: { ...state.notifications, ...patch },
        })),
    }),
    { name: SETTINGS_STORAGE_KEY },
  ),
);

export default useSettingsStore;
export const CompanySettings = DEFAULT_COMPANY;
