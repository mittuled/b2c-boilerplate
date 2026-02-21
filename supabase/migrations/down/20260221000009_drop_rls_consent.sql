-- DOWN migration: drops RLS policies on consent_entries
drop policy if exists "consent_entries_select_own" on public.consent_entries;
drop policy if exists "consent_entries_insert_own" on public.consent_entries;
drop policy if exists "consent_entries_select_admin" on public.consent_entries;
alter table public.consent_entries disable row level security;
