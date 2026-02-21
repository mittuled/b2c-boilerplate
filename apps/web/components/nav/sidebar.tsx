'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/lib/use-permissions';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/settings/profile', label: 'Profile' },
  { href: '/settings/sessions', label: 'Sessions' },
  { href: '/settings/privacy', label: 'Privacy' },
  { href: '/settings/appearance', label: 'Appearance' },
  { href: '/settings/mfa', label: 'Security' },
];

const adminItems = [
  { href: '/admin', label: 'Admin Panel', permission: 'users.read' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  return (
    <nav aria-label="Main navigation" className="w-64 border-r p-4">
      <ul className="space-y-1">
        {navItems.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${pathname === item.href ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
        {adminItems.map(item => (
          hasPermission(item.permission) && (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm ${pathname === item.href ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {item.label}
              </Link>
            </li>
          )
        ))}
      </ul>
    </nav>
  );
}
