const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = {
  // Auth endpoint
  auth: {
    staffLogin: async (email, password) => {
      const response = await fetch(`${API_BASE}/auth/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return response.json();
    },

    logout: async (token) => {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.json();
    },

    getProfile: async (token) => {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    // --- NEW: Change Password ---
    changePassword: async (token, current_password, new_password) => {
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ current_password, new_password }),
      });
      return response.json();
    },

    // --- NEW: Update Profile (Name, Phone, etc) ---
    updateProfile: async (token, data) => {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    // --- NEW: Upload/Avatar Endpoint (You will need to code this backend side) ---
    uploadAvatar: async (token, formData) => {
      // Note: DO NOT set 'Content-Type' header when using FormData. Fetch sets it automatically with the boundary.
      const response = await fetch(`${API_BASE}/auth/avatar`, {
        method: "PUT", // Or PUT
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' <-- REMOVE THIS, fetch adds it automatically
        },
        body: formData,
      });
      return response.json();
    },
  },

  // Users endpoint
  users: {
    getAll: async (token, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/users?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    getOne: async (token, id) => {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    create: async (token, data) => {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    update: async (token, id, data) => {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    updateStatus: async (token, id, status) => {
      const response = await fetch(`${API_BASE}/users/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },

    delete: async (token, id) => {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    bulkDelete: async (token, ids) => {
      const response = await fetch(`${API_BASE}/users/bulk-delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });
      return response.json();
    },

    exportCSV: async (token, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/users/export?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.text(); // For CSV, we just get text back!
    },
  },

  // Quotes endpoint
  quotes: {
    getAll: async (token, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/quotes?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    getOne: async (token, id) => {
      const response = await fetch(`${API_BASE}/quotes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    create: async (data) => {
      const response = await fetch(`${API_BASE}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    downloadProforma: async (token, id, format = "pdf") => {
      const response = await fetch(
        `${API_BASE}/quotes/${id}/proforma/download?format=${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // ✅ Throw on HTTP errors so the caller can show the real message
      if (!response.ok) {
        let message = `Download failed (${response.status})`;
        try {
          const data = await response.json();
          message = data?.message || data?.error || message;
        } catch {
          // response wasn't JSON — keep the status-based message
        }
        throw new Error(message);
      }

      // ✅ Guard against an empty body
      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error("The server returned an empty file.");
      }
      return blob;
    },

    resendProforma: async (token, id) => {
      const response = await fetch(`${API_BASE}/quotes/${id}/proforma/resend`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    updateStatus: async (token, id, status) => {
      const response = await fetch(`${API_BASE}/quotes/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },

    generateProforma: async (token, id, data) => {
      const response = await fetch(`${API_BASE}/quotes/${id}/proforma`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // ✅ Read ONCE — into a variable
      const body = await response.json().catch(() => ({}));

      // ✅ Branch on the already-read body
      if (!response.ok || body.success === false) {
        const err = new Error(
          body.message || `Request failed (${response.status})`,
        );
        err.status = response.status;
        err.body = body;
        throw err;
      }

      return body;
    },

    recordPO: async (token, id, data) => {
      const response = await fetch(`${API_BASE}/quotes/${id}/purchase-order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    delete: async (token, id) => {
      const response = await fetch(`${API_BASE}/quotes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    bulkDelete: async (token, ids) => {
      const response = await fetch(`${API_BASE}/quotes/bulk-delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });
      return response.json();
    },

    export: async (token, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/quotes/export?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.blob();
    },
  },

  // Dashboard endpoint
  dashboard: {
    getStats: async (token) => {
      const response = await fetch(`${API_BASE}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  },

  // Categories endpoint
  categories: {
    getAll: async (token) => {
      const response = await fetch(`${API_BASE}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },

    create: async (token, formData) => {
      const response = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      return response.json();
    },

    update: async (token, id, formData) => {
      const response = await fetch(`${API_BASE}/categories/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      return response.json();
    },

    delete: async (token, id) => {
      const response = await fetch(`${API_BASE}/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    },
  },

  // Products endpoint
  products: {
    getAll: async (token, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/products?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    getOne: async (token, id) => {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    create: async (token, formData) => {
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      return response.json();
    },

    update: async (token, id, formData) => {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      return response.json();
    },

    delete: async (token, id) => {
      const response = await fetch(`${API_BASE}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
  },

  // Settings endpoint
  settings: {
    getCompany: async (token) => {
      const response = await fetch(`${API_BASE}/settings/company`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    updateCompany: async (token, data) => {
      const response = await fetch(`${API_BASE}/settings/company`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    getNotifications: async (token) => {
      const response = await fetch(`${API_BASE}/settings/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    updateNotifications: async (token, data) => {
      const response = await fetch(`${API_BASE}/settings/notifications`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },

  // Activity Logs endpoint
  activityLogs: {
    getAll: async (token, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE}/activity-logs?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },
  },

  // Newsletter endpoint
  newsletter: {
    // Public: Subscribe
    subscribe: async (data) => {
      const response = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    // Public: Unsubscribe
    unsubscribe: async (id) => {
      const response = await fetch(`${API_BASE}/newsletter/unsubscribe/${id}`);
      return response.json();
    },

    // Dashboard: Get all subscribers
    getSubscribers: async (token, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_BASE}/newsletter/subscribers?${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.json();
    },

    // Dashboard: Get stats
    getStats: async (token) => {
      const response = await fetch(`${API_BASE}/newsletter/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    // Dashboard: Delete subscriber
    deleteSubscriber: async (token, id) => {
      const response = await fetch(`${API_BASE}/newsletter/subscribers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();
    },

    // Dashboard: Export CSV
    exportCSV: async (token, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(
        `${API_BASE}/newsletter/export?${queryString}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.blob();
    },
  },

  notifications: {
    list: async (token, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      const r = await fetch(`${API_BASE}/notifications?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("Failed to load notifications");
      return r.json();
    },
    unreadCount: async (token) => {
      const r = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("Failed to load count");
      return r.json();
    },
    markRead: async (token, id) => {
      const r = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      return r.json();
    },
    markAllRead: async (token) => {
      const r = await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      return r.json();
    },
  },
};

export default api;
