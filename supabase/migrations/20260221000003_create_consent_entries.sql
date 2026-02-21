-- Migration: 003_create_consent_entries
-- Append-only audit log for privacy and consent changes (GDPR compliance)

create table public.consent_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  value boolean not null,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

comment on table public.consent_entries is 'Append-only audit log for all privacy and consent changes. Each change creates a new row.';
comment on column public.consent_entries.ip_address is 'PII — Captured at time of change';
comment on column public.consent_entries.user_agent is 'PII — Captured at time of change';
comment on column public.consent_entries.consent_type is 'marketing_email, marketing_push, cookie_analytics, cookie_advertising';

-- Index for efficient current-consent lookups
create index idx_consent_user_type on public.consent_entries(user_id, consent_type, created_at desc);
