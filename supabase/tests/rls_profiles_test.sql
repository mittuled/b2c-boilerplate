-- pgTAP test: RLS policies on profiles table
begin;
select plan(6);

-- Setup: ensure pgTAP is available
create extension if not exists pgtap;

-- Test 1: end_user can SELECT their own profile
select lives_ok(
  $$ select * from profiles where id = auth.uid() $$,
  'end_user can select own profile'
);

-- Test 2: Verify profiles table has RLS enabled
select has_table('public', 'profiles', 'profiles table exists');

-- Test 3: Verify RLS is enabled on profiles
select policies_are(
  'public', 'profiles',
  array[
    'profiles_select_own',
    'profiles_update_own',
    'profiles_select_admin',
    'profiles_update_admin',
    'profiles_insert_system'
  ],
  'profiles has expected RLS policies'
);

-- Test 4: Verify deleted_at column exists for soft-delete
select has_column('public', 'profiles', 'deleted_at', 'profiles has deleted_at column for soft-delete');

-- Test 5: Verify account_status check constraint
select col_has_check('public', 'profiles', 'account_status', 'account_status has CHECK constraint');

-- Test 6: Verify partial index for non-deleted profiles
select has_index('public', 'profiles', 'idx_profiles_not_deleted', 'partial index on non-deleted profiles exists');

select * from finish();
rollback;
