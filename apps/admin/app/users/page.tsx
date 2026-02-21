'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface UserWithRole {
  id: string;
  display_name: string;
  account_status: string;
  role_name: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    let query = supabase.from('v_user_with_role').select('id, display_name, account_status, role_name, created_at');
    if (search) query = query.ilike('display_name', `%${search}%`);
    const { data } = await query.order('created_at', { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }

  const statusColor: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    deactivated: 'bg-gray-100 text-gray-700',
    unverified: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="mt-4">
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadUsers()} placeholder="Search users..." aria-label="Search users" className="w-full max-w-sm rounded-md border px-3 py-2" />
      </div>
      {loading ? <p className="mt-4" aria-busy="true">Loading...</p> : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
              <th className="p-2">Joined</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.display_name}</td>
                <td className="p-2"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{u.role_name}</span></td>
                <td className="p-2"><span className={`rounded-full px-2 py-0.5 text-xs ${statusColor[u.account_status] ?? ''}`}>{u.account_status}</span></td>
                <td className="p-2">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-2"><Link href={`/users/${u.id}`} className="text-blue-600 hover:underline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
