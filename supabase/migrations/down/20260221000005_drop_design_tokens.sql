-- DOWN migration: drops design_tokens table
do $$
begin
  if current_setting('app.environment', true) = 'production' then
    raise exception 'Cannot run down migration in production without safety override';
  end if;
end $$;

drop table if exists public.design_tokens cascade;
