-- DOWN migration: drops RLS policies on RBAC tables
drop policy if exists "role_definitions_select_authenticated" on public.role_definitions;
drop policy if exists "role_definitions_manage_admin" on public.role_definitions;
drop policy if exists "permissions_select_authenticated" on public.permissions;
drop policy if exists "role_permissions_select_authenticated" on public.role_permissions;
drop policy if exists "user_roles_select_own" on public.user_roles;
drop policy if exists "user_roles_select_admin" on public.user_roles;
drop policy if exists "user_roles_manage_admin" on public.user_roles;
alter table public.role_definitions disable row level security;
alter table public.permissions disable row level security;
alter table public.role_permissions disable row level security;
alter table public.user_roles disable row level security;
