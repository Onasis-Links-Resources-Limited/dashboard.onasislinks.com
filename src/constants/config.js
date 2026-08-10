export const APP_CONFIG = {
  name: 'Onasis Links Dashboard',
  version: '1.0.0',
  company: 'Onasis Links Resources Limited',
  year: new Date().getFullYear(),
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'onasis_auth_token',
  THEME: 'onasis_theme',
};

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
};