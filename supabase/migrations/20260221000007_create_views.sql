-- Migration: 006_create_views
-- Creates convenience views per data-model.md

-- Current consent state per user per type (latest entry wins)
create view public.v_current_consents as
select distinct on (user_id, consent_type)
  user_id,
  consent_type,
  value,
  created_at as changed_at
from public.consent_entries
order by user_id, consent_type, created_at desc;

comment on view public.v_current_consents is 'Latest consent state per user per consent type.';

-- User with role info
create view public.v_user_with_role as
select
  p.*,
  rd.name as role_name,
  rd.hierarchy_level
from public.profiles p
join public.user_roles ur on ur.user_id = p.id and ur.deleted_at is null
join public.role_definitions rd on rd.id = ur.role_id
where p.deleted_at is null;

comment on view public.v_user_with_role is 'Profiles joined with role information. Filters soft-deleted records.';
