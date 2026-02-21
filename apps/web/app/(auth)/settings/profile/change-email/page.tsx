'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-provider';

export default function ChangeEmailPage() {
  const { supabase } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error: updateError } = await supabase.auth.updateUser({ email: newEmail });
    if (updateError) {
      setError(updateError.message);
    } else {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-lg p-6 text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-gray-600">We sent a verification link to {newEmail}. Click the link to confirm your new email address.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold">Change Email</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && <div role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <div>
          <label htmlFor="newEmail" className="block text-sm font-medium">New email address</label>
          <input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required aria-required="true" className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Update email</button>
      </form>
    </main>
  );
}
