export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const ADMIN_DNI = 35523278;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];