import { describe, it, expect } from 'vitest';

interface UserClaims {
  user_role: string;
  user_permissions: string[];
}

function hasPermission(claims: UserClaims, permission: string): boolean {
  return claims.user_permissions.includes(permission);
}

function hasRole(claims: UserClaims, role: string): boolean {
  return claims.user_role === role;
}

describe('Permission Guard', () => {
  const adminClaims: UserClaims = { user_role: 'admin', user_permissions: ['users.read', 'users.manage', 'sessions.read', 'sessions.manage'] };
  const endUserClaims: UserClaims = { user_role: 'end_user', user_permissions: [] };

  it('should grant access when user has required permission', () => {
    expect(hasPermission(adminClaims, 'users.read')).toBe(true);
  });

  it('should deny access when user lacks permission', () => {
    expect(hasPermission(endUserClaims, 'users.read')).toBe(false);
  });

  it('should check role correctly', () => {
    expect(hasRole(adminClaims, 'admin')).toBe(true);
    expect(hasRole(endUserClaims, 'admin')).toBe(false);
  });

  it('should handle empty permissions', () => {
    expect(hasPermission(endUserClaims, 'anything')).toBe(false);
  });
});
