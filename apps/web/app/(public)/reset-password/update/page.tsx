'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';

const PASSWORD_REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { supabase } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const allMet = PASSWORD_REQUIREMENTS.every(r => r.test(password));
  const passwordsMatch = password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allMet || !passwordsMatch) return;

    setError('');
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
    } else {
      router.push('/login?message=password_updated');
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-center text-2xl font-bold">Set new password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          <div>
            <label htmlFor="password" className="block text-sm font-medium">New password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-required="true" aria-describedby="pw-reqs" className="mt-1 block w-full rounded-md border px-3 py-2" />
            <div id="pw-reqs" className="mt-2 space-y-1">
              {PASSWORD_REQUIREMENTS.map((req) => (
                <p key={req.label} className={`text-xs ${req.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                  {req.test(password) ? '✓' : '○'} {req.label}
                </p>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium">Confirm password</label>
            <input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required aria-required="true" aria-invalid={confirmPassword.length > 0 && !passwordsMatch} className="mt-1 block w-full rounded-md border px-3 py-2" />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
            )}
          </div>
          <button type="submit" disabled={loading || !allMet || !passwordsMatch} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </main>
  );
}
