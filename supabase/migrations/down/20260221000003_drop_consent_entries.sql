-- DOWN migration: drops consent_entries table
do $$
begin
  if current_setting('app.environment', true) = 'production' then
    raise exception 'Cannot run down migration in production without safety override';
  end if;
end $$;

drop index if exists idx_consent_user_type;
drop table if exists public.consent_entries cascade;
