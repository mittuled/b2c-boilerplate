'use client';

import { useMemo } from 'react';
import { useAuth } from './auth-provider';

export function usePermissions() {
  const { session } = useAuth();

  return useMemo(() => {
    const claims = session?.access_token
      ? JSON.parse(atob(session.access_token.split('.')[1]))
      : null;

    const appMetadata = claims?.app_metadata ?? {};
    const role: string = appMetadata.user_role ?? 'end_user';
    const permissions: string[] = appMetadata.user_permissions ?? [];

    return {
      role,
      permissions,
      hasPermission: (key: string) => permissions.includes(key),
      hasRole: (name: string) => role === name,
      isAdmin: role === 'admin' || role === 'super_admin',
      isModerator: role === 'moderator' || role === 'admin' || role === 'super_admin',
    };
  }, [session]);
}
