-- Migration: 013_session_functions
-- Security definer function to query auth.sessions for the current user

create or replace function public.get_my_sessions()
returns table (
  session_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  user_agent text,
  ip inet
) as $$
begin
  return query
  select
    s.id as session_id,
    s.created_at,
    s.updated_at,
    s.user_agent,
    s.ip
  from auth.sessions s
  where s.user_id = auth.uid()
    and s.not_after > now()
  order by s.updated_at desc;
end;
$$ language plpgsql security definer stable;

comment on function public.get_my_sessions() is 'Returns active sessions for the current authenticated user.';

grant execute on function public.get_my_sessions() to authenticated;
