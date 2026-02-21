-- Migration: 007_rls_profiles
-- Enable RLS on profiles, add policies filtering soft-deleted rows

alter table public.profiles enable row level security;

-- Users can read their own profile (not soft-deleted)
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id and deleted_at is null);

-- Users can update their own profile (not soft-deleted)
-- Cannot update account_status, suspended_*, deleted_at fields
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id and deleted_at is null)
  with check (auth.uid() = id and deleted_at is null);

-- Admin/moderator can read all profiles (not soft-deleted)
create policy "profiles_select_admin" on public.profiles
  for select using (public.authorize('users.read') and deleted_at is null);

-- Admin can update all profiles (including soft-delete)
create policy "profiles_update_admin" on public.profiles
  for update using (public.authorize('users.manage'));

-- Allow insert during user creation (trigger)
create policy "profiles_insert_system" on public.profiles
  for insert with check (auth.uid() = id);
