import { describe, expect, it } from 'bun:test';
import { UserRole } from '@/lib/roles';

describe('UserRole', () => {
  it('has all expected roles', () => {
    expect(UserRole.ADMIN).toBe('ADMIN');
    expect(UserRole.MANAGER).toBe('MANAGER');
    expect(UserRole.VENDOR).toBe('VENDOR');
    expect(UserRole.CUSTOMER_SERVICE).toBe('CUSTOMER_SERVICE');
    expect(UserRole.USER).toBe('USER');
  });

  it('has exactly 5 roles', () => {
    expect(Object.keys(UserRole)).toHaveLength(5);
  });
});
