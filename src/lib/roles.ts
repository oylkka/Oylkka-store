export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  VENDOR: 'VENDOR',
  CUSTOMER_SERVICE: 'CUSTOMER_SERVICE',
  USER: 'USER',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Human-readable labels for each role, used in role badges. */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  VENDOR: 'Vendor',
  CUSTOMER_SERVICE: 'Customer Service',
  USER: 'Customer',
};

/** Resolve a display label for a role string, falling back to the raw value. */
export function getRoleLabel(role: string | null | undefined): string | null {
  if (!role) return null;
  return ROLE_LABELS[role as UserRole] ?? role;
}
