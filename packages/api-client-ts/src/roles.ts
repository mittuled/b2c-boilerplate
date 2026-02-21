import type { SupabaseClient } from '@supabase/supabase-js';

export function createRoleHelpers(client: SupabaseClient) {
  return {
    async listRoles() {
      return client.from('role_definitions').select('*').order('hierarchy_level');
    },

    async getUserRole(userId: string) {
      return client.from('v_user_with_role').select('role_name, hierarchy_level').eq('id', userId).single();
    },

    async assignRole(userId: string, roleId: string) {
      return client.from('user_roles').update({ role_id: roleId }).eq('user_id', userId);
    },

    async listPermissions() {
      return client.from('permissions').select('*').order('module, key');
    },
  };
}
