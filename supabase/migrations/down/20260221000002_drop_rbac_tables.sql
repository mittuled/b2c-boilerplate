-- DOWN migration: drops RBAC tables
do $$
begin
  if current_setting('app.environment', true) = 'production' then
    raise exception 'Cannot run down migration in production without safety override';
  end if;
end $$;

drop index if exists idx_user_roles_not_deleted;
drop index if exists idx_user_roles_user_id;
drop table if exists public.user_roles cascade;
drop table if exists public.role_permissions cascade;
drop table if exists public.permissions cascade;
drop table if exists public.role_definitions cascade;
