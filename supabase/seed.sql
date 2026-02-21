-- Seed: B2C Boilerplate Foundation
-- Idempotent — safe to run multiple times

-- Role definitions
insert into public.role_definitions (name, description, hierarchy_level) values
  ('super_admin', 'Full system access. Can manage roles, users, and all settings.', 0),
  ('admin', 'Administrative access. Can manage users and content but not roles.', 1),
  ('moderator', 'Moderation access. Can view users and manage content.', 2),
  ('end_user', 'Standard user. No administrative permissions.', 3)
on conflict (name) do nothing;

-- Permissions
insert into public.permissions (key, description, module) values
  ('users.read', 'View user profiles and details', 'profile'),
  ('users.manage', 'Update user profiles and account status', 'profile'),
  ('users.delete', 'Delete user accounts', 'profile'),
  ('roles.read', 'View role definitions', 'rbac'),
  ('roles.manage', 'Create, update, delete roles and assign to users', 'rbac'),
  ('sessions.read', 'View user sessions', 'session'),
  ('sessions.manage', 'Revoke user sessions and force logout', 'session'),
  ('profiles.read', 'View detailed profile information', 'profile'),
  ('profiles.manage', 'Update any user profile', 'profile'),
  ('settings.read', 'View application settings', 'settings'),
  ('settings.manage', 'Update application settings and design tokens', 'settings')
on conflict (key) do nothing;

-- Role-permission mappings
-- super_admin gets ALL permissions
insert into public.role_permissions (role_id, permission_id)
select rd.id, p.id
from public.role_definitions rd
cross join public.permissions p
where rd.name = 'super_admin'
on conflict do nothing;

-- admin gets all except roles.manage
insert into public.role_permissions (role_id, permission_id)
select rd.id, p.id
from public.role_definitions rd
cross join public.permissions p
where rd.name = 'admin' and p.key != 'roles.manage'
on conflict do nothing;

-- moderator gets read-only permissions
insert into public.role_permissions (role_id, permission_id)
select rd.id, p.id
from public.role_definitions rd
cross join public.permissions p
where rd.name = 'moderator' and p.key in ('users.read', 'profiles.read', 'sessions.read')
on conflict do nothing;

-- end_user gets no admin permissions (empty)

-- Design tokens (semantic tokens for light/dark modes)
insert into public.design_tokens (key, category, light_value, dark_value, description) values
  -- Colors
  ('color.primary', 'color', '#2563eb', '#3b82f6', 'Primary brand color'),
  ('color.primary.hover', 'color', '#1d4ed8', '#60a5fa', 'Primary color hover state'),
  ('color.secondary', 'color', '#7c3aed', '#8b5cf6', 'Secondary brand color'),
  ('color.background', 'color', '#ffffff', '#0f172a', 'Page background'),
  ('color.surface', 'color', '#f8fafc', '#1e293b', 'Card/surface background'),
  ('color.text.primary', 'color', '#0f172a', '#f8fafc', 'Primary text color'),
  ('color.text.secondary', 'color', '#475569', '#94a3b8', 'Secondary text color'),
  ('color.text.muted', 'color', '#94a3b8', '#475569', 'Muted/disabled text'),
  ('color.border', 'color', '#e2e8f0', '#334155', 'Default border color'),
  ('color.error', 'color', '#dc2626', '#ef4444', 'Error/destructive color'),
  ('color.success', 'color', '#16a34a', '#22c55e', 'Success color'),
  ('color.warning', 'color', '#d97706', '#f59e0b', 'Warning color'),
  ('color.info', 'color', '#2563eb', '#3b82f6', 'Informational color'),
  -- Typography
  ('text.body.size', 'typography', '1rem', '1rem', 'Body text size'),
  ('text.body.lineHeight', 'typography', '1.5', '1.5', 'Body line height'),
  ('text.heading.size', 'typography', '2rem', '2rem', 'Main heading size'),
  ('text.small.size', 'typography', '0.875rem', '0.875rem', 'Small text size'),
  -- Spacing
  ('spacing.xs', 'spacing', '0.25rem', '0.25rem', 'Extra small spacing'),
  ('spacing.sm', 'spacing', '0.5rem', '0.5rem', 'Small spacing'),
  ('spacing.md', 'spacing', '1rem', '1rem', 'Medium spacing'),
  ('spacing.lg', 'spacing', '1.5rem', '1.5rem', 'Large spacing'),
  ('spacing.xl', 'spacing', '2rem', '2rem', 'Extra large spacing'),
  -- Radius
  ('radius.sm', 'radius', '0.25rem', '0.25rem', 'Small border radius'),
  ('radius.md', 'radius', '0.375rem', '0.375rem', 'Medium border radius'),
  ('radius.lg', 'radius', '0.5rem', '0.5rem', 'Large border radius'),
  ('radius.full', 'radius', '9999px', '9999px', 'Full/pill border radius'),
  -- Shadow
  ('shadow.sm', 'shadow', '0 1px 2px 0 rgb(0 0 0 / 0.05)', '0 1px 2px 0 rgb(0 0 0 / 0.3)', 'Small shadow'),
  ('shadow.md', 'shadow', '0 4px 6px -1px rgb(0 0 0 / 0.1)', '0 4px 6px -1px rgb(0 0 0 / 0.4)', 'Medium shadow'),
  ('shadow.lg', 'shadow', '0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 10px 15px -3px rgb(0 0 0 / 0.4)', 'Large shadow')
on conflict (key) do nothing;
