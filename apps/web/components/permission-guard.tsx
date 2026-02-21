'use client';

import type { ReactNode } from 'react';
import { usePermissions } from '@/lib/use-permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  role?: string;
  fallback?: ReactNode;
}

export function PermissionGuard({ children, permission, role, fallback = null }: PermissionGuardProps) {
  const { hasPermission, hasRole } = usePermissions();

  if (permission && !hasPermission(permission)) return <>{fallback}</>;
  if (role && !hasRole(role)) return <>{fallback}</>;

  return <>{children}</>;
}
