-- Migration: 015_auth_triggers
-- Triggers for automatic profile creation, role assignment, email verification, updated_at

-- Function: auto-create profile when auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_role_id uuid;
begin
  -- Create profile
  insert into public.profiles (id, display_name, account_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    case when new.email_confirmed_at is not null then 'active' else 'unverified' end
  );

  -- Assign default end_user role
  select id into default_role_id from public.role_definitions where name = 'end_user';
  
  if default_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, default_role_id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function: update profile status when email is verified
create or replace function public.handle_email_verified()
returns trigger as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    update public.profiles
    set account_status = 'active'
    where id = new.id and account_status = 'unverified';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_email_verified
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_email_verified();

-- Function: auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_design_tokens_updated_at
  before update on public.design_tokens
  for each row execute function public.handle_updated_at();
