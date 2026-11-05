import { create } from "zustand";
import { api } from "../services/api";

export const DEFAULT_COMPANY = {
  name: "", address: "", tel: "", email: "",
  rcNumber: "", taxId: "", vatNo: "", vatRate: 7.5,
  bank: { bankerName: "", accountName: "", accountNumber: "" },
};

export const DEFAULT_NOTIFICATIONS = {
  notifyOnNewQuoteRequest: true,
  notifyOnPurchaseOrder: true,
  proformaEmailSubject: "Proforma Invoice {proformaNumber} - Onasis Links Resources Limited",
  internalNotifyEmails: "",
};

export const useSettingsStore = create((set, get) => ({
  company: DEFAULT_COMPANY,
  notifications: DEFAULT_NOTIFICATIONS,
  loading: false,
  loaded: false,

  fetchSettings: async () => {
    if (get().loading) return;
    set({ loading: true });
    const token = localStorage.getItem("token");
    try {
      const [c, n] = await Promise.all([
        api.settings.getCompany(token),
        api.settings.getNotifications(token),
      ]);
      set({
        company: c.data || DEFAULT_COMPANY,
        notifications: n.data || DEFAULT_NOTIFICATIONS,
        loaded: true,
      });
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      set({ loading: false });
    }
  },

  updateCompany: async (next) => {
    const token = localStorage.getItem("token");
    try {
      const r = await api.updateCompany(token, next);
      if (r.success) { set({ company: r.data }); return true; }
      return false;
    } catch { return false; }
  },

  updateNotifications: async (next) => {
    const token = localStorage.getItem("token");
    try {
      const r = await api.updateNotifications(token, next);
      if (r.success) { set({ notifications: r.data }); return true; }
      return false;
    } catch { return false; }
  },

  resetCompany: () => set({ company: DEFAULT_COMPANY }),
}));