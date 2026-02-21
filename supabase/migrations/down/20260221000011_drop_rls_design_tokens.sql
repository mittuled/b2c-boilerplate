-- DOWN migration: drops RLS policies on design_tokens
drop policy if exists "design_tokens_select_all" on public.design_tokens;
drop policy if exists "design_tokens_manage_admin" on public.design_tokens;
alter table public.design_tokens disable row level security;
