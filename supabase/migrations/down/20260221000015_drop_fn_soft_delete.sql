-- DOWN migration: drops soft delete functions
drop function if exists public.soft_delete_profile(uuid);
drop function if exists public.soft_delete_user_role(uuid, text);
