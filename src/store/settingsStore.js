import { create } from "zustand";
import api from "../services/api";

export const DEFAULT_COMPANY = {
  name: "Onasis Links Resources Limited",
  address: "12, Adeola Odeku Street, Victoria Island, Lagos",
  tel: "+234-701-234-5678",
  email: "info@onasislinks.com",
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

export const DEFAULT_NOTIFICATIONS = {
  notifyOnNewQuoteRequest: true,
  notifyOnPurchaseOrder: true,
  proformaEmailSubject: "Proforma Invoice {proformaNumber} - Onasis Links Resources Limited",
  internalNotifyEmails: "sales@onasisltd.com, manager@onasisltd.com",
};

export const useSettingsStore = create((set, get) => ({
  company: DEFAULT_COMPANY,
  notifications: DEFAULT_NOTIFICATIONS,
  loading: false,
  error: null,

  // ✅ Fetch settings from backend on load
  fetchSettings: async () => {
    set({ loading: true, error: null });
    const token = localStorage.getItem("token");
    try {
      const companyRes = await api.settings.getCompany(token);
      const notifRes = await api.settings.getNotifications(token);

      if (companyRes.success) set({ company: companyRes.data });
      if (notifRes.success) set({ notifications: notifRes.data });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      set({ error: "Failed to load settings" });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Update Company
  updateCompany: async (patch) => {
    const token = localStorage.getItem("token");
    try {
      const response = await api.settings.updateCompany(token, patch);
      if (response.success) {
        set({ company: response.data });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update company:", error);
      return false;
    }
  },

  updateCompanyBank: async (patch) => {
    const current = get().company;
    const updated = { ...current, bank: { ...current.bank, ...patch } };
    const token = localStorage.getItem("token");
    try {
      const response = await api.settings.updateCompany(token, updated);
      if (response.success) {
        set({ company: response.data });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update bank:", error);
      return false;
    }
  },

  // ✅ Update Notifications
  updateNotifications: async (patch) => {
    const token = localStorage.getItem("token");
    try {
      const response = await api.settings.updateNotifications(token, patch);
      if (response.success) {
        set({ notifications: response.data });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update notifications:", error);
      return false;
    }
  },

  resetCompany: () => set({ company: DEFAULT_COMPANY }),
}));