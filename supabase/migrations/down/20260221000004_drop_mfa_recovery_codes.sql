-- DOWN migration: drops mfa_recovery_codes table
do $$
begin
  if current_setting('app.environment', true) = 'production' then
    raise exception 'Cannot run down migration in production without safety override';
  end if;
end $$;

drop index if exists idx_mfa_recovery_codes_user;
drop table if exists public.mfa_recovery_codes cascade;
