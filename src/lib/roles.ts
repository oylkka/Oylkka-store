export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  VENDOR: 'VENDOR',
  CUSTOMER_SERVICE: 'CUSTOMER_SERVICE',
  USER: 'USER',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
