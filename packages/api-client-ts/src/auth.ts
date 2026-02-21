import type { SupabaseClient } from '@supabase/supabase-js';

export function createAuthHelpers(client: SupabaseClient) {
  return {
    async signUp(email: string, password: string, captchaToken?: string) {
      return client.auth.signUp({
        email,
        password,
        options: { captchaToken },
      });
    },

    async signInWithPassword(email: string, password: string, captchaToken?: string) {
      return client.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      });
    },

    async signInWithOAuth(provider: 'google' | 'apple', redirectTo?: string) {
      return client.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
    },

    async signOut() {
      return client.auth.signOut();
    },

    async resetPasswordForEmail(email: string, captchaToken?: string) {
      return client.auth.resetPasswordForEmail(email, {
        captchaToken,
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password/update`,
      });
    },

    async updatePassword(password: string) {
      return client.auth.updateUser({ password });
    },

    async getSession() {
      return client.auth.getSession();
    },

    async getUser() {
      return client.auth.getUser();
    },

    onAuthStateChange(callback: Parameters<typeof client.auth.onAuthStateChange>[0]) {
      return client.auth.onAuthStateChange(callback);
    },

    // MFA helpers
    mfa: {
      async enroll() {
        return client.auth.mfa.enroll({ factorType: 'totp' });
      },

      async challenge(factorId: string) {
        return client.auth.mfa.challenge({ factorId });
      },

      async verify(factorId: string, challengeId: string, code: string) {
        return client.auth.mfa.verify({ factorId, challengeId, code });
      },

      async listFactors() {
        return client.auth.mfa.listFactors();
      },
    },
  };
}

export type AuthHelpers = ReturnType<typeof createAuthHelpers>;
