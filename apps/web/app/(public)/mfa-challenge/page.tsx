'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';

export default function MFAChallengePage() {
  const router = useRouter();
  const { supabase } = useAuth();
  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];
      if (!totpFactor) {
        setError('No MFA factor found');
        return;
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });
      if (challengeError) {
        setError(challengeError.message);
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
          <p className="mt-2 text-gray-600">
            {useRecovery
              ? 'Enter one of your recovery codes'
              : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {error && <div role="alert" className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          <div>
            <label htmlFor="mfa-code" className="block text-sm font-medium">
              {useRecovery ? 'Recovery code' : 'Verification code'}
            </label>
            <input
              id="mfa-code"
              type="text"
              inputMode={useRecovery ? 'text' : 'numeric'}
              maxLength={useRecovery ? 8 : 6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              aria-required="true"
              className="mt-1 block w-full rounded-md border px-3 py-2 text-center text-lg tracking-widest"
              placeholder={useRecovery ? 'XXXXXX' : '000000'}
            />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setUseRecovery(!useRecovery); setCode(''); setError(''); }}
          className="block w-full text-center text-sm text-blue-600 hover:text-blue-500"
        >
          {useRecovery ? 'Use authenticator app instead' : 'Use a recovery code instead'}
        </button>
      </div>
    </main>
  );
}
