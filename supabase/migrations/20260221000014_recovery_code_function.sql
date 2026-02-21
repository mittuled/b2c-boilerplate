-- Migration: 014_recovery_code_function
-- Security definer function to validate MFA recovery codes

create or replace function public.validate_recovery_code(recovery_code text)
returns boolean as $$
declare
  matched_id uuid;
begin
  -- Find an unused code matching the provided code
  -- Uses pgcrypto crypt() for bcrypt comparison
  select id into matched_id
  from public.mfa_recovery_codes
  where user_id = auth.uid()
    and used_at is null
    and code_hash = crypt(recovery_code, code_hash)
  limit 1;

  if matched_id is null then
    return false;
  end if;

  -- Mark the code as used
  update public.mfa_recovery_codes
  set used_at = now()
  where id = matched_id;

  return true;
end;
$$ language plpgsql security definer;

comment on function public.validate_recovery_code(text) is 'Validates and consumes a MFA recovery code for the current user.';

-- Enable pgcrypto for bcrypt
create extension if not exists pgcrypto;

grant execute on function public.validate_recovery_code(text) to authenticated;
