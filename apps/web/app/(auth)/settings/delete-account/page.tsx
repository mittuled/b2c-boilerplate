'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';

export default function DeleteAccountPage() {
  const router = useRouter();
  const { supabase } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed) return;
    setLoading(true);
    setError('');

    // Re-authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password });
    if (authError) {
      setError('Incorrect password');
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session!.access_token}` },
    });

    if (res.ok) {
      await supabase.auth.signOut();
      router.push('/?deleted=true');
    } else {
      setError('Failed to delete account');
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold text-red-600">Delete Account</h1>
      <div className="mt-4 rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">This action will:</p>
        <ul className="mt-2 list-inside list-disc text-sm text-red-700">
          <li>Remove your profile information</li>
          <li>Delete your avatar</li>
          <li>Revoke all active sessions</li>
          <li>This cannot be undone</li>
        </ul>
      </div>
      <form onSubmit={handleDelete} className="mt-6 space-y-4">
        {error && <div role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Confirm your password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-required="true" className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} aria-label="I understand this is permanent" />
          <span className="text-sm">I understand this action is permanent and cannot be undone</span>
        </label>
        <button type="submit" disabled={loading || !confirmed} className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50">
          {loading ? 'Deleting...' : 'Delete my account'}
        </button>
      </form>
    </main>
  );
}
