'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';

export default function VerifyEmailPage() {
  const { supabase } = useAuth();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  async function handleResend() {
    const { data } = await supabase.auth.getUser();
    if (data.user?.email) {
      await supabase.auth.resend({
        type: 'signup',
        email: data.user.email,
      });
      setResent(true);
      setResendCooldown(60);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <span className="text-2xl">✉</span>
        </div>
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-gray-600">
          We sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
        {resent && (
          <p role="status" className="text-sm text-green-600">Verification email resent!</p>
        )}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {resendCooldown > 0
            ? `Resend in ${resendCooldown}s`
            : 'Resend verification email'}
        </button>
      </div>
    </main>
  );
}
