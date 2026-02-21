'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-provider';

interface Session {
  session_id: string;
  created_at: string;
  updated_at: string;
  user_agent: string;
  ip: string;
  is_current: boolean;
}

function parseDevice(ua: string): string {
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Unknown';
}

export default function SessionsPage() {
  const { supabase } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/manage-sessions`,
      { headers: { Authorization: `Bearer ${session.access_token}` } },
    );
    const data = await res.json();
    setSessions(data.data ?? []);
    setLoading(false);
  }

  async function revokeSession(sessionId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/manage-sessions?session_id=${sessionId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${session.access_token}` } },
    );
    await loadSessions();
  }

  async function revokeAllOthers() {
    const others = sessions.filter(s => !s.is_current);
    for (const s of others) {
      await revokeSession(s.session_id);
    }
  }

  if (loading) return <main className="p-6"><p aria-busy="true">Loading sessions...</p></main>;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Active Sessions</h1>
        {sessions.filter(s => !s.is_current).length > 0 && (
          <button
            onClick={revokeAllOthers}
            className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            Revoke all other sessions
          </button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {sessions.map((session) => (
          <div key={session.session_id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{parseDevice(session.user_agent)}</span>
                {session.is_current && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Current session
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">IP: {session.ip}</p>
              <p className="text-sm text-gray-500">
                Last active: {new Date(session.updated_at).toLocaleString()}
              </p>
            </div>
            {!session.is_current && (
              <button
                onClick={() => revokeSession(session.session_id)}
                className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
              >
                Revoke
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
