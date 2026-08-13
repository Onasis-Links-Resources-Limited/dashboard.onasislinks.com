import React, { createContext, useContext, useCallback } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  // Minimal toast API used by the app: success, error, warning
  const toast = {
    success: (msg) => console.info("TOAST success:", msg),
    error: (msg) => console.error("TOAST error:", msg),
    warning: (msg) => console.warn("TOAST warn:", msg),
  };

  const value = { toast };
  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // fallback: provide no-op toast methods to avoid runtime errors
    return {
      toast: {
        success: () => {},
        error: () => {},
        warning: () => {},
      },
    };
  }
  return ctx;
};

export default ToastContext;
