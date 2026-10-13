import { describe, expect, it } from 'bun:test';
import { getRoleLabel, ROLE_LABELS, USER_ROLES } from '@/lib/roles';

describe('USER_ROLES', () => {
  it('has all expected roles', () => {
    expect(USER_ROLES.ADMIN).toBe('ADMIN');
    expect(USER_ROLES.MANAGER).toBe('MANAGER');
    expect(USER_ROLES.VENDOR).toBe('VENDOR');
    expect(USER_ROLES.CUSTOMER_SERVICE).toBe('CUSTOMER_SERVICE');
    expect(USER_ROLES.USER).toBe('USER');
  });

  it('has exactly 5 roles', () => {
    expect(Object.keys(USER_ROLES)).toHaveLength(5);
  });
});

describe('getRoleLabel', () => {
  it('labels every known role', () => {
    for (const role of Object.values(USER_ROLES)) {
      expect(ROLE_LABELS[role]).toBeTruthy();
      expect(getRoleLabel(role)).toBe(ROLE_LABELS[role]);
    }
  });

  it('uses friendly labels for staff and customers', () => {
    expect(getRoleLabel('ADMIN')).toBe('Admin');
    expect(getRoleLabel('CUSTOMER_SERVICE')).toBe('Customer Service');
    expect(getRoleLabel('USER')).toBe('Customer');
  });

  it('returns null for missing roles', () => {
    expect(getRoleLabel(null)).toBeNull();
    expect(getRoleLabel(undefined)).toBeNull();
    expect(getRoleLabel('')).toBeNull();
  });

  it('falls back to the raw value for unknown roles', () => {
    expect(getRoleLabel('SUPERUSER')).toBe('SUPERUSER');
  });
});
