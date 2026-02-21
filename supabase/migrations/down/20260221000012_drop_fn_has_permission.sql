-- DOWN migration: drops has_permission function
drop function if exists public.has_permission(uuid, text);
