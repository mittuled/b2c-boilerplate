/**
 * Database types for B2C Boilerplate
 * 
 * NOTE: This file should be regenerated from the local Supabase instance:
 *   supabase gen types typescript --local > contracts/generated/typescript/database.ts
 * 
 * This manual version serves as a working placeholder until Supabase is running.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          timezone: string;
          preferred_language: string;
          account_status: 'unverified' | 'active' | 'suspended' | 'deactivated';
          suspended_at: string | null;
          suspended_reason: string | null;
          deactivated_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          timezone?: string;
          preferred_language?: string;
          account_status?: 'unverified' | 'active' | 'suspended' | 'deactivated';
          suspended_at?: string | null;
          suspended_reason?: string | null;
          deactivated_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          timezone?: string;
          preferred_language?: string;
          account_status?: 'unverified' | 'active' | 'suspended' | 'deactivated';
          suspended_at?: string | null;
          suspended_reason?: string | null;
          deactivated_at?: string | null;
          deleted_at?: string | null;
          updated_at?: string;
        };
      };
      role_definitions: {
        Row: {
          id: string;
          name: string;
          description: string;
          hierarchy_level: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          hierarchy_level: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          hierarchy_level?: number;
        };
      };
      permissions: {
        Row: {
          id: string;
          key: string;
          description: string;
          module: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          description: string;
          module: string;
          created_at?: string;
        };
        Update: {
          key?: string;
          description?: string;
          module?: string;
        };
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          assigned_by: string | null;
          assigned_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          assigned_by?: string | null;
          assigned_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          role_id?: string;
          assigned_by?: string | null;
          deleted_at?: string | null;
        };
      };
      consent_entries: {
        Row: {
          id: string;
          user_id: string;
          consent_type: string;
          value: boolean;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          consent_type: string;
          value: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      mfa_recovery_codes: {
        Row: {
          id: string;
          user_id: string;
          code_hash: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code_hash: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          used_at?: string | null;
        };
      };
      design_tokens: {
        Row: {
          id: string;
          key: string;
          category: 'color' | 'typography' | 'spacing' | 'radius' | 'shadow';
          light_value: string;
          dark_value: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          category: 'color' | 'typography' | 'spacing' | 'radius' | 'shadow';
          light_value: string;
          dark_value: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          category?: 'color' | 'typography' | 'spacing' | 'radius' | 'shadow';
          light_value?: string;
          dark_value?: string;
          description?: string | null;
        };
      };
    };
    Views: {
      v_current_consents: {
        Row: {
          user_id: string;
          consent_type: string;
          value: boolean;
          changed_at: string;
        };
      };
      v_user_with_role: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          timezone: string;
          preferred_language: string;
          account_status: string;
          role_name: string;
          hierarchy_level: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      authorize: {
        Args: { requested_permission: string };
        Returns: boolean;
      };
      get_my_sessions: {
        Args: Record<string, never>;
        Returns: {
          session_id: string;
          created_at: string;
          updated_at: string;
          user_agent: string;
          ip: string;
        }[];
      };
      validate_recovery_code: {
        Args: { recovery_code: string };
        Returns: boolean;
      };
      custom_access_token_hook: {
        Args: { event: Json };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
}
