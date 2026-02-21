-- pgTAP test: RLS policies on consent_entries (append-only)
begin;
select plan(4);

create extension if not exists pgtap;

-- Test 1: Table exists
select has_table('public', 'consent_entries', 'consent_entries table exists');

-- Test 2: RLS enabled
select rls_enabled('public', 'consent_entries', 'RLS enabled on consent_entries');

-- Test 3: Has expected policies
select policies_are(
  'public', 'consent_entries',
  array[
    'consent_select_own',
    'consent_insert_own',
    'consent_select_admin'
  ],
  'consent_entries has correct policies (no UPDATE/DELETE for append-only)'
);

-- Test 4: Verify index for efficient lookups
select has_index('public', 'consent_entries', 'idx_consent_user_type', 'consent lookup index exists');

select * from finish();
rollback;
