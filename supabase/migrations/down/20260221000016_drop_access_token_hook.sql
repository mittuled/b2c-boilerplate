-- DOWN migration: drops custom access token hook
drop function if exists public.custom_access_token_hook(jsonb);
