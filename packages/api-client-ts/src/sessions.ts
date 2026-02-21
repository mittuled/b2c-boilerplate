interface Session {
  session_id: string;
  created_at: string;
  updated_at: string;
  user_agent: string;
  ip: string;
  is_current: boolean;
}

export function createSessionHelpers(supabaseUrl: string, getAccessToken: () => Promise<string | null>) {
  async function fetchWithAuth(path: string, options: RequestInit = {}) {
    const token = await getAccessToken();
    return fetch(`${supabaseUrl}/functions/v1/manage-sessions${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  }

  return {
    async listSessions(): Promise<Session[]> {
      const res = await fetchWithAuth('');
      const data = await res.json();
      return data.data ?? [];
    },

    async revokeSession(sessionId: string): Promise<void> {
      await fetchWithAuth(`?session_id=${sessionId}`, { method: 'DELETE' });
    },

    async revokeAllOtherSessions(sessions: Session[]): Promise<void> {
      const others = sessions.filter(s => !s.is_current);
      await Promise.all(others.map(s => this.revokeSession(s.session_id)));
    },

    async forceLogout(userId: string): Promise<void> {
      await fetchWithAuth('/force-logout', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
    },
  };
}
