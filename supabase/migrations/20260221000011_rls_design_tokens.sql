-- Migration: 011_rls_design_tokens
-- RLS for design_tokens: readable by all authenticated, managed by admin

alter table public.design_tokens enable row level security;

-- All authenticated users can read tokens (public configuration)
create policy "design_tokens_select_authenticated" on public.design_tokens
  for select using (auth.role() = 'authenticated');

-- Admin can manage tokens
create policy "design_tokens_manage" on public.design_tokens
  for all using (public.authorize('settings.manage'));
