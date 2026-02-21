-- DOWN migration: drops RLS policies on mfa_recovery_codes
drop policy if exists "mfa_recovery_codes_select_own" on public.mfa_recovery_codes;
drop policy if exists "mfa_recovery_codes_insert_own" on public.mfa_recovery_codes;
drop policy if exists "mfa_recovery_codes_update_own" on public.mfa_recovery_codes;
drop policy if exists "mfa_recovery_codes_delete_own" on public.mfa_recovery_codes;
alter table public.mfa_recovery_codes disable row level security;
