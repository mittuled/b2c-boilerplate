-- Migration: 001_create_profiles
-- Creates the profiles table extending auth.users with application-specific data

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null constraint profiles_display_name_length check (char_length(display_name) <= 100),
  avatar_url text,
  bio text constraint profiles_bio_length check (char_length(bio) <= 500),
  phone text unique,
  timezone text not null default 'UTC',
  preferred_language text not null default 'en',
  account_status text not null default 'unverified'
    constraint profiles_account_status_check check (account_status in ('unverified', 'active', 'suspended', 'deactivated')),
  suspended_at timestamptz,
  suspended_reason text,
  deactivated_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Extends auth.users with application-specific profile data. One row per user.';
comment on column public.profiles.display_name is 'PII — User display name';
comment on column public.profiles.avatar_url is 'PII — Supabase Storage path for avatar';
comment on column public.profiles.bio is 'PII — User biography';
comment on column public.profiles.phone is 'PII — E.164 format phone number';
comment on column public.profiles.deleted_at is 'Soft-delete timestamp; non-NULL = deleted (AC-5)';

-- Indexes
create index idx_profiles_account_status on public.profiles(account_status);
create index idx_profiles_not_deleted on public.profiles(id) where deleted_at is null;
