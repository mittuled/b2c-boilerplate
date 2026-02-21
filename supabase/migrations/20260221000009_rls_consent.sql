-- Migration: 009_rls_consent
-- RLS for consent_entries: append-only audit log

alter table public.consent_entries enable row level security;

-- Users can read their own consent entries
create policy "consent_select_own" on public.consent_entries
  for select using (auth.uid() = user_id);

-- Users can insert their own consent entries
create policy "consent_insert_own" on public.consent_entries
  for insert with check (auth.uid() = user_id);

-- Admin can read all consent entries (compliance reporting)
create policy "consent_select_admin" on public.consent_entries
  for select using (public.authorize('users.read'));

-- No UPDATE or DELETE policies — append-only audit log
