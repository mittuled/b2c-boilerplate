-- DOWN migration: drops has_role function
drop function if exists public.has_role(uuid, text);
