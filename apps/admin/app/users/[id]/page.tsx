'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => { loadUser(); loadRoles(); }, [id]);

  async function loadUser() {
    const { data } = await supabase.from('v_user_with_role').select('*').eq('id', id).single();
    setUser(data);
    setLoading(false);
  }

  async function loadRoles() {
    const { data } = await supabase.from('role_definitions').select('*').order('hierarchy_level');
    setRoles(data ?? []);
  }

  async function changeRole(roleId: string) {
    await supabase.from('user_roles').update({ role_id: roleId }).eq('user_id', id);
    await loadUser();
  }

  async function suspendUser() {
    await supabase.from('profiles').update({ account_status: 'suspended', suspended_at: new Date().toISOString(), suspended_reason: 'Admin action' }).eq('id', id);
    await loadUser();
  }

  if (loading) return <main className="p-6"><p>Loading...</p></main>;
  if (!user) return <main className="p-6"><p>User not found</p></main>;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">{user.display_name}</h1>
      <div className="mt-4 space-y-4">
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Profile</h2>
          <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">Status</dt><dd>{user.account_status}</dd>
            <dt className="text-gray-500">Role</dt><dd>{user.role_name}</dd>
            <dt className="text-gray-500">Timezone</dt><dd>{user.timezone}</dd>
            <dt className="text-gray-500">Language</dt><dd>{user.preferred_language}</dd>
          </dl>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Change Role</h2>
          <select onChange={(e) => changeRole(e.target.value)} defaultValue="" className="mt-2 rounded-md border px-3 py-2" aria-label="Select role">
            <option value="" disabled>Select role...</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="rounded-lg border p-4">
          <h2 className="font-semibold">Actions</h2>
          <div className="mt-2 flex gap-2">
            <button onClick={suspendUser} className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50">Suspend</button>
          </div>
        </div>
      </div>
    </main>
  );
}
