-- Migration: 004_create_mfa_recovery_codes
-- Stores hashed recovery codes for MFA

create table public.mfa_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.mfa_recovery_codes is 'Hashed recovery codes for MFA. 10 codes per enrollment. Old codes deleted on re-enrollment.';
comment on column public.mfa_recovery_codes.code_hash is 'bcrypt hash of the recovery code';

create index idx_mfa_recovery_codes_user on public.mfa_recovery_codes(user_id);
