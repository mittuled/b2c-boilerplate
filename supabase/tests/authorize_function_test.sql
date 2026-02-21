-- pgTAP test: authorize() function
begin;
select plan(3);

create extension if not exists pgtap;

-- Test 1: Function exists
select has_function(
  'public', 'authorize', array['text'],
  'authorize(text) function exists'
);

-- Test 2: Function is security definer
select is_definer(
  'public', 'authorize', array['text'],
  'authorize is security definer'
);

-- Test 3: Function returns boolean
select function_returns(
  'public', 'authorize', array['text'], 'boolean',
  'authorize returns boolean'
);

select * from finish();
rollback;
