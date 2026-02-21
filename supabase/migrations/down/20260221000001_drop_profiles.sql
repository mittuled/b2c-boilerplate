-- DOWN migration: drops profiles table
-- WARNING: This will permanently delete all profile data
-- Only run in development or with explicit backup confirmation

do $$
begin
  if current_setting('app.environment', true) = 'production' then
    raise exception 'Cannot run down migration in production without safety override. Set app.confirm_rollback = true';
  end if;
end $$;

drop index if exists idx_profiles_not_deleted;
drop index if exists idx_profiles_account_status;
drop table if exists public.profiles cascade;
