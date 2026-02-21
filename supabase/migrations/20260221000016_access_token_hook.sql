-- Migration: 016_access_token_hook
-- Custom access token hook that injects user_role and user_permissions into JWT claims

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb as $$
declare
  claims jsonb;
  user_role_name text;
  user_perms jsonb;
begin
  claims := event -> 'claims';

  -- Get user's role name
  select rd.name into user_role_name
  from public.user_roles ur
  join public.role_definitions rd on rd.id = ur.role_id
  where ur.user_id = (event ->> 'user_id')::uuid
    and ur.deleted_at is null
  limit 1;

  -- Get user's permissions as JSON array
  select coalesce(jsonb_agg(p.key), '[]'::jsonb) into user_perms
  from public.user_roles ur
  join public.role_permissions rp on rp.role_id = ur.role_id
  join public.permissions p on p.id = rp.permission_id
  where ur.user_id = (event ->> 'user_id')::uuid
    and ur.deleted_at is null;

  -- Inject into app_metadata claims
  claims := jsonb_set(claims, '{app_metadata}',
    coalesce(claims -> 'app_metadata', '{}'::jsonb) ||
    jsonb_build_object(
      'user_role', coalesce(user_role_name, 'end_user'),
      'user_permissions', coalesce(user_perms, '[]'::jsonb)
    )
  );

  -- Update the claims in the event
  event := jsonb_set(event, '{claims}', claims);

  return event;
end;
$$ language plpgsql security definer stable;

comment on function public.custom_access_token_hook(jsonb) is 'Auth hook: injects user_role and user_permissions into JWT claims on token mint/refresh.';

-- Grant usage to supabase_auth_admin (required for auth hooks)
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;

-- Revoke from public for security
revoke execute on function public.custom_access_token_hook(jsonb) from public;
revoke execute on function public.custom_access_token_hook(jsonb) from anon;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated;
