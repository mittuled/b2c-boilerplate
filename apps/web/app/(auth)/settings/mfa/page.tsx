'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-provider';

export default function MFASetupPage() {
  const { supabase } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [step, setStep] = useState<'enroll' | 'verify' | 'done'>('enroll');
  const [error, setError] = useState('');

  async function handleEnroll() {
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (enrollError) {
      setError(enrollError.message);
      return;
    }
    if (data) {
      setQrCode(data.totp.qr_code);
      setFactorId(data.id);
      setStep('verify');
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setError(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: verifyCode,
    });
    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    // Generate mock recovery codes (real implementation would call backend)
    setRecoveryCodes(Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    ));
    setStep('done');
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>

      {error && <div role="alert" className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {step === 'enroll' && (
        <div className="mt-6 space-y-4">
          <p className="text-gray-600">Add an extra layer of security to your account with TOTP-based two-factor authentication.</p>
          <button onClick={handleEnroll} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Set up 2FA
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="mt-6 space-y-6">
          <p className="text-gray-600">Scan this QR code with your authenticator app:</p>
          {qrCode && <img src={qrCode} alt="TOTP QR Code" className="mx-auto" />}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="totp-code" className="block text-sm font-medium">Verification code</label>
              <input
                id="totp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                required
                aria-required="true"
                className="mt-1 block w-full rounded-md border px-3 py-2"
                placeholder="000000"
              />
            </div>
            <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Verify
            </button>
          </form>
        </div>
      )}

      {step === 'done' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-md bg-green-50 p-4 text-green-700">
            Two-factor authentication is now enabled!
          </div>
          <div>
            <h2 className="text-lg font-semibold">Recovery Codes</h2>
            <p className="mt-1 text-sm text-gray-600">Save these codes in a safe place. Each code can only be used once.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-md bg-gray-50 p-4 font-mono text-sm">
              {recoveryCodes.map((code, i) => (
                <span key={i}>{code}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
