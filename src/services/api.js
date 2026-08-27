const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = {
  // Auth endpoints
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

  // Users endpoints
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
  },

  // Quotes endpoints
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
      return response.json();
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
};

export default api;
