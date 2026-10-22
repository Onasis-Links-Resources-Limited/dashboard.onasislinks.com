import { apiFetch } from "./apiClient";

export const api = {
  // Auth
  auth: {
    staffLogin: (email, password) =>
      apiFetch("/auth/staff/login", {
        method: "POST",
        body: { email, password },
        skipAuth: true,  // no token needed
      }),

    logout: () =>
      apiFetch("/auth/logout", { method: "POST" }),

    getProfile: () =>
      apiFetch("/auth/me"),

    changePassword: (current_password, new_password) =>
      apiFetch("/auth/change-password", {
        method: "PUT",
        body: { current_password, new_password },
      }),

    updateProfile: (data) =>
      apiFetch("/auth/profile", { method: "PUT", body: data }),

    uploadAvatar: (formData) =>
      apiFetch("/auth/avatar", { method: "PUT", body: formData }),
  },

  // Users
  users: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiFetch(`/users?${qs}`);
    },
    getOne: (id) => apiFetch(`/users/${id}`),
    create: (data) => apiFetch("/users", { method: "POST", body: data }),
    update: (id, data) => apiFetch(`/users/${id}`, { method: "PUT", body: data }),
    updateStatus: (id, status) =>
      apiFetch(`/users/${id}/status`, { method: "PUT", body: { status } }),
    delete: (id) => apiFetch(`/users/${id}`, { method: "DELETE" }),
    bulkDelete: (ids) =>
      apiFetch("/users/bulk-delete", { method: "POST", body: { ids } }),
    exportCSV: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiFetch(`/users/export?${qs}`);
    },
  },

  // Quotes
  quotes: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiFetch(`/quotes?${qs}`);
    },
    getOne: (id) => apiFetch(`/quotes/${id}`),
    create: (data) =>
      apiFetch("/quotes", { method: "POST", body: data, skipAuth: true }),

    registerPO: (data) =>
      apiFetch("/quotes/register-po", { method: "POST", body: data }),

    downloadProforma: (id, format = "pdf") =>
      apiFetch(`/quotes/${id}/proforma/download?format=${format}`, { raw: true })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Download failed (${res.status})`);
          const blob = await res.blob();
          if (!blob || blob.size === 0) {
            throw new Error("The server returned an empty file.");
          }
          return blob;
        }),

    downloadWaybill: (id) =>
      apiFetch(`/quotes/${id}/waybill/download`, { raw: true })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Waybill download failed (${res.status})`);
          const blob = await res.blob();
          if (!blob || blob.size === 0) {
            throw new Error("The server returned an empty waybill.");
          }
          return blob;
        }),

    resendProforma: (id) =>
      apiFetch(`/quotes/${id}/proforma/resend`, { method: "POST" }),

    updateStatus: (id, status, extra = {}) =>
      apiFetch(`/quotes/${id}/status`, {
        method: "PUT",
        body: { status, ...extra },
      }),

    generateProforma: (id, data) =>
      apiFetch(`/quotes/${id}/proforma`, { method: "POST", body: data }),

    recordPO: (id, data) =>
      apiFetch(`/quotes/${id}/purchase-order`, { method: "POST", body: data }),

    delete: (id) => apiFetch(`/quotes/${id}`, { method: "DELETE" }),
    bulkDelete: (ids) =>
      apiFetch("/quotes/bulk-delete", { method: "POST", body: { ids } }),
    export: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiFetch(`/quotes/export?${qs}`, { raw: true })
        .then((res) => res.blob());
    },
  },

  // Dashboard
  dashboard: {
    getStats: () => apiFetch("/dashboard"),
  },

  // Categories
  categories: {
    getAll: () => apiFetch("/categories"),
    create: (formData) =>
      apiFetch("/categories", { method: "POST", body: formData }),
    update: (id, formData) =>
      apiFetch(`/categories/${id}`, { method: "PUT", body: formData }),
    delete: (id) => apiFetch(`/categories/${id}`, { method: "DELETE" }),
  },

  // Products
  products: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiFetch(`/products?${qs}`);
    },
    getOne: (id) => apiFetch(`/products/${id}`),
    create: (formData) =>
      apiFetch("/products", { method: "POST", body: formData }),
    bulkCreate: (products) =>
      apiFetch("/products/bulk", { method: "POST", body: { products } }),
    update: (id, formData) =>
      apiFetch(`/products/${id}`, { method: "PUT", body: formData }),
    delete: (id) => apiFetch(`/products/${id}`, { method: "DELETE" }),
  },

  // Settings
  settings: {
    getCompany: () => apiFetch("/settings/company"),
    updateCompany: (data) =>
      apiFetch("/settings/company", { method: "PUT", body: data }),
    getNotifications: () => apiFetch("/settings/notifications"),
    updateNotifications: (data) =>
      apiFetch("/settings/notifications", { method: "PUT", body: data }),
  },

  // Activity logs
  activityLogs: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiFetch(`/activity-logs?${qs}`);
    },
  },

  // Newsletter
  newsletter: {
    subscribe: (data) =>
      apiFetch("/newsletter/subscribe", {
        method: "POST",
        body: data,
        skipAuth: true,
      }),
    unsubscribe: (id) =>
      apiFetch(`/newsletter/unsubscribe/${id}`, { skipAuth: true }),
    getSubscribers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiFetch(`/newsletter/subscribers?${qs}`);
    },
    getStats: () => apiFetch("/newsletter/stats"),
    deleteSubscriber: (id) =>
      apiFetch(`/newsletter/subscribers/${id}`, { method: "DELETE" }),
    exportCSV: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiFetch(`/newsletter/export?${qs}`, { raw: true })
        .then((res) => res.blob());
    },
  },

  // Notifications
  notifications: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return apiFetch(`/notifications?${qs}`);
    },
    unreadCount: () => apiFetch("/notifications/unread-count"),
    markRead: (id) =>
      apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () =>
      apiFetch("/notifications/read-all", { method: "PATCH" }),
  },
};

export default api;