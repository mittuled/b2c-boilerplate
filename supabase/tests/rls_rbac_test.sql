-- pgTAP test: RLS policies on RBAC tables
begin;
select plan(8);

create extension if not exists pgtap;

-- Test 1-4: Tables exist
select has_table('public', 'role_definitions', 'role_definitions table exists');
select has_table('public', 'permissions', 'permissions table exists');
select has_table('public', 'role_permissions', 'role_permissions table exists');
select has_table('public', 'user_roles', 'user_roles table exists');

-- Test 5: RLS enabled on all RBAC tables
select rls_enabled('public', 'role_definitions', 'RLS enabled on role_definitions');
select rls_enabled('public', 'permissions', 'RLS enabled on permissions');
select rls_enabled('public', 'role_permissions', 'RLS enabled on role_permissions');
select rls_enabled('public', 'user_roles', 'RLS enabled on user_roles');

select * from finish();
rollback;
