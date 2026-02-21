-- DOWN migration: drops views
drop view if exists public.v_user_with_role;
drop view if exists public.v_current_consents;
