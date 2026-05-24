export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  VENDOR: 'VENDOR',
  CUSTOMER_SERVICE: 'CUSTOMER_SERVICE',
  USER: 'USER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
