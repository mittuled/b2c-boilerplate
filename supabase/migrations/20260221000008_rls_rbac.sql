-- Migration: 008_rls_rbac
-- RLS for role_definitions, permissions, role_permissions, user_roles

-- role_definitions: readable by all authenticated
alter table public.role_definitions enable row level security;

create policy "role_definitions_select_authenticated" on public.role_definitions
  for select using (auth.role() = 'authenticated');

create policy "role_definitions_manage" on public.role_definitions
  for all using (public.authorize('roles.manage'));

-- permissions: readable by all authenticated
alter table public.permissions enable row level security;

create policy "permissions_select_authenticated" on public.permissions
  for select using (auth.role() = 'authenticated');

create policy "permissions_manage" on public.permissions
  for all using (public.authorize('roles.manage'));

-- role_permissions: readable by all authenticated
alter table public.role_permissions enable row level security;

create policy "role_permissions_select_authenticated" on public.role_permissions
  for select using (auth.role() = 'authenticated');

create policy "role_permissions_manage" on public.role_permissions
  for all using (public.authorize('roles.manage'));

-- user_roles: users can read own, admin can manage
alter table public.user_roles enable row level security;

create policy "user_roles_select_own" on public.user_roles
  for select using (auth.uid() = user_id and deleted_at is null);

create policy "user_roles_select_admin" on public.user_roles
  for select using (public.authorize('users.read') and deleted_at is null);

create policy "user_roles_manage" on public.user_roles
  for all using (public.authorize('roles.manage'));

-- Allow insert during user creation (trigger)
create policy "user_roles_insert_system" on public.user_roles
  for insert with check (auth.uid() = user_id);
