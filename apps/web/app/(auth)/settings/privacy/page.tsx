'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-provider';
import Link from 'next/link';

const CONSENT_TYPES = [
  { key: 'marketing_email', label: 'Marketing emails' },
  { key: 'marketing_push', label: 'Push notifications' },
  { key: 'cookie_analytics', label: 'Analytics cookies' },
  { key: 'cookie_advertising', label: 'Advertising cookies' },
];

export default function PrivacyPage() {
  const { user, supabase } = useAuth();
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadConsents();
  }, [user]);

  async function loadConsents() {
    const { data } = await supabase.from('v_current_consents').select('*').eq('user_id', user!.id);
    const map: Record<string, boolean> = {};
    data?.forEach((c: any) => { map[c.consent_type] = c.value; });
    setConsents(map);
    setLoading(false);
  }

  async function toggleConsent(type: string) {
    const newValue = !consents[type];
    setConsents(prev => ({ ...prev, [type]: newValue }));
    await supabase.from('consent_entries').insert({
      user_id: user!.id,
      consent_type: type,
      value: newValue,
    });
  }

  async function handleExport() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/export-data`,
      { headers: { Authorization: `Bearer ${session.access_token}` } },
    );
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-data.json';
    a.click();
  }

  if (loading) return <main className="p-6"><p aria-busy="true">Loading...</p></main>;

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold">Privacy Settings</h1>

      <section className="mt-6 space-y-4">
        <h2 className="text-lg font-semibold">Consent Preferences</h2>
        {CONSENT_TYPES.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between rounded-lg border p-4">
            <span>{label}</span>
            <button
              role="switch"
              aria-checked={!!consents[key]}
              onClick={() => toggleConsent(key)}
              className={`relative h-6 w-11 rounded-full transition-colors ${consents[key] ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${consents[key] ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        ))}
      </section>

      <section className="mt-8 space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold">Your Data</h2>
        <div className="flex gap-4">
          <button onClick={handleExport} className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
            Download my data
          </button>
          <Link href="/settings/delete-account" className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            Delete my account
          </Link>
        </div>
      </section>
    </main>
  );
}
