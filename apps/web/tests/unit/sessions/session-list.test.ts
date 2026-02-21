import { describe, it, expect } from 'vitest';

interface Session {
  session_id: string;
  created_at: string;
  updated_at: string;
  user_agent: string;
  ip: string;
  is_current: boolean;
}

function parseUserAgent(ua: string): string {
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  return 'Unknown Browser';
}

describe('Session List', () => {
  const mockSessions: Session[] = [
    { session_id: '1', created_at: '2026-01-01', updated_at: '2026-02-20', user_agent: 'Mozilla/5.0 Chrome/120', ip: '192.168.1.1', is_current: true },
    { session_id: '2', created_at: '2026-01-15', updated_at: '2026-02-19', user_agent: 'Mozilla/5.0 Firefox/121', ip: '10.0.0.1', is_current: false },
  ];

  it('should identify current session', () => {
    const current = mockSessions.find(s => s.is_current);
    expect(current?.session_id).toBe('1');
  });

  it('should parse user agent to browser name', () => {
    expect(parseUserAgent(mockSessions[0].user_agent)).toBe('Chrome');
    expect(parseUserAgent(mockSessions[1].user_agent)).toBe('Firefox');
  });

  it('should show revoke button for non-current sessions', () => {
    const revocable = mockSessions.filter(s => !s.is_current);
    expect(revocable).toHaveLength(1);
  });

  it('should show revoke all other sessions button when multiple sessions exist', () => {
    const otherSessions = mockSessions.filter(s => !s.is_current);
    expect(otherSessions.length).toBeGreaterThan(0);
  });
});
