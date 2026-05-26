import { describe, expect, it } from 'bun:test';
import { USER_ROLES } from '@/lib/roles';

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
