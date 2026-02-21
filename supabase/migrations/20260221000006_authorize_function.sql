-- Migration: 012_authorize_function
-- Security definer function used in RLS policies to check JWT claims

create or replace function public.authorize(requested_permission text)
returns boolean as $$
declare
  user_permissions jsonb;
begin
  -- Extract permissions from JWT claims (injected by custom_access_token_hook)
  user_permissions := coalesce(
    ((auth.jwt() -> 'app_metadata') -> 'user_permissions'),
    '[]'::jsonb
  );
  
  return user_permissions ? requested_permission;
end;
$$ language plpgsql security definer stable;

comment on function public.authorize(text) is 'Checks if the current user JWT contains the requested permission key.';

-- Grant execute to authenticated users (needed for RLS policy evaluation)
grant execute on function public.authorize(text) to authenticated;
