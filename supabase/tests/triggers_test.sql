-- pgTAP test: Auth triggers
begin;
select plan(5);

create extension if not exists pgtap;

-- Test 1: handle_new_user function exists
select has_function(
  'public', 'handle_new_user', array[]::text[],
  'handle_new_user() trigger function exists'
);

-- Test 2: handle_email_verified function exists
select has_function(
  'public', 'handle_email_verified', array[]::text[],
  'handle_email_verified() trigger function exists'
);

-- Test 3: handle_updated_at function exists
select has_function(
  'public', 'handle_updated_at', array[]::text[],
  'handle_updated_at() trigger function exists'
);

-- Test 4: Trigger on auth.users for new user
select trigger_is(
  'auth', 'users', 'on_auth_user_created',
  'public', 'handle_new_user',
  'on_auth_user_created trigger calls handle_new_user'
);

-- Test 5: Trigger on profiles for updated_at
select trigger_is(
  'public', 'profiles', 'set_profiles_updated_at',
  'public', 'handle_updated_at',
  'profiles updated_at trigger calls handle_updated_at'
);

select * from finish();
rollback;
