-- Migration: 010_rls_mfa_recovery
-- RLS for mfa_recovery_codes: no direct access, security definer only

alter table public.mfa_recovery_codes enable row level security;

-- No policies — all access through security definer functions
-- This ensures recovery codes can only be validated/created via controlled functions
