import type { SupabaseClient } from '@supabase/supabase-js';

export function createProfileHelpers(client: SupabaseClient) {
  return {
    async getProfile(userId: string) {
      return client.from('profiles').select('*').eq('id', userId).single();
    },

    async updateProfile(userId: string, data: {
      display_name?: string;
      bio?: string;
      timezone?: string;
      preferred_language?: string;
    }) {
      return client.from('profiles').update(data).eq('id', userId).select().single();
    },

    async uploadAvatar(userId: string, file: File) {
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;
      const { error } = await client.storage.from('avatars').upload(path, file, { upsert: true });
      if (error) return { data: null, error };

      const { data: { publicUrl } } = client.storage.from('avatars').getPublicUrl(path);
      return client.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId).select().single();
    },

    async getConsentHistory(userId: string) {
      return client.from('consent_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    },

    async getCurrentConsents(userId: string) {
      return client.from('v_current_consents')
        .select('*')
        .eq('user_id', userId);
    },

    async updateConsent(userId: string, consentType: string, value: boolean) {
      return client.from('consent_entries').insert({
        user_id: userId,
        consent_type: consentType,
        value,
      });
    },
  };
}
