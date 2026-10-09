import { useState, useEffect, useCallback } from "react";

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const usePersistedState = (key, initialValue) => {
  const getFallback = () =>
    typeof initialValue === "function" ? initialValue() : initialValue;

  const [value, setValue] = useState(() => {
    const fallback = getFallback();
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        localStorage.removeItem(key);
        return fallback;
      }

      const { value: storedValue, savedAt } = parsed;

      if (typeof savedAt !== "number" || Date.now() - savedAt > MAX_AGE_MS) {
        localStorage.removeItem(key);
        return fallback;
      }

      // ✅ Guard: if fallback is object/array, stored value must match shape
      if (
        typeof fallback === "object" &&
        fallback !== null &&
        (storedValue === null || typeof storedValue !== typeof fallback)
      ) {
        localStorage.removeItem(key);
        return fallback;
      }

      // ✅ Guard: if fallback is array, stored value must be array
      if (Array.isArray(fallback) && !Array.isArray(storedValue)) {
        localStorage.removeItem(key);
        return fallback;
      }

      return storedValue === undefined ? fallback : storedValue;
    } catch {
      localStorage.removeItem(key);
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify({ value, savedAt: Date.now() }));
    } catch { /* empty */ }
  }, [key, value]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {  /* empty */ }
  }, [key]);

  return [value, setValue, clear];
};