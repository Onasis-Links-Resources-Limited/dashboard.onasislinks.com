export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES: 'sales',
  USER: 'user',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.SALES]: 'Sales Representative',
  [ROLES.USER]: 'User',
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: '#E6501B',
  [ROLES.MANAGER]: '#C3110C',
  [ROLES.SALES]: '#740A03',
  [ROLES.USER]: '#280905',
};

export const ROLE_ICONS = {
  [ROLES.ADMIN]: '🛡️',
  [ROLES.MANAGER]: '📋',
  [ROLES.SALES]: '💼',
  [ROLES.USER]: '👤',
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canManageProducts: true,
    canManageCategories: true,
    canManageUsers: true,
    canManageRoles: true,
    canManageQuotes: true,
    canViewAnalytics: true,
    canDeleteAny: true,
    canEditAny: true,
  },
  [ROLES.MANAGER]: {
    canManageProducts: true,
    canManageCategories: true,
    canManageUsers: false,
    canManageRoles: false,
    canManageQuotes: true,
    canViewAnalytics: true,
    canDeleteAny: false,
    canEditAny: true,
  },
  [ROLES.SALES]: {
    canManageProducts: false,
    canManageCategories: false,
    canManageUsers: false,
    canManageRoles: false,
    canManageQuotes: true,
    canViewAnalytics: false,
    canDeleteAny: false,
    canEditAny: false,
  },
  [ROLES.USER]: {
    canManageProducts: false,
    canManageCategories: false,
    canManageUsers: false,
    canManageRoles: false,
    canManageQuotes: false,
    canViewAnalytics: false,
    canDeleteAny: false,
    canEditAny: false,
  },
};