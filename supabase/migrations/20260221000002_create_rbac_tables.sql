-- Migration: 002_create_rbac_tables
-- Creates role_definitions, permissions, role_permissions, and user_roles tables

-- Role definitions: predefined role types
create table public.role_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  hierarchy_level int not null unique,
  created_at timestamptz not null default now()
);

comment on table public.role_definitions is 'Predefined role types with hierarchy. Lower hierarchy_level = more powerful.';

-- Permissions: atomic permission definitions
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text not null,
  module text not null,
  created_at timestamptz not null default now()
);

comment on table public.permissions is 'Atomic permission definitions. Format: resource.action (e.g., users.read)';

-- Role-permission mappings
create table public.role_permissions (
  role_id uuid not null references public.role_definitions(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(role_id, permission_id)
);

comment on table public.role_permissions is 'Join table mapping roles to their permission sets.';

-- User-role assignments (one role per user)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  role_id uuid not null references public.role_definitions(id) on delete restrict,
  assigned_by uuid references auth.users(id),
  assigned_at timestamptz not null default now(),
  deleted_at timestamptz
);

comment on table public.user_roles is 'Maps each user to exactly one role. Soft-delete supported (AC-5).';
comment on column public.user_roles.deleted_at is 'Soft-delete timestamp per AC-5';

-- Indexes
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_user_roles_not_deleted on public.user_roles(user_id) where deleted_at is null;
