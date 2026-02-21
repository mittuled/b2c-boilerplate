/**
 * Seed Auth Users
 * Creates test users via Supabase Admin API
 * Run: npx tsx infra/scripts/seed-auth-users.ts
 */

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

interface TestUser {
  email: string;
  password: string;
  role: string;
  verified: boolean;
  status: string;
}

const TEST_USERS: TestUser[] = [
  { email: 'superadmin@test.com', password: 'Test1234!', role: 'super_admin', verified: true, status: 'active' },
  { email: 'admin@test.com', password: 'Test1234!', role: 'admin', verified: true, status: 'active' },
  { email: 'moderator@test.com', password: 'Test1234!', role: 'moderator', verified: true, status: 'active' },
  { email: 'user@test.com', password: 'Test1234!', role: 'end_user', verified: true, status: 'active' },
  { email: 'unverified@test.com', password: 'Test1234!', role: 'end_user', verified: false, status: 'unverified' },
  { email: 'suspended@test.com', password: 'Test1234!', role: 'end_user', verified: true, status: 'suspended' },
  { email: 'deactivated@test.com', password: 'Test1234!', role: 'end_user', verified: true, status: 'deactivated' },
];

async function createUser(user: TestUser): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: user.verified,
      user_metadata: { full_name: user.email.split('@')[0] },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (body.includes('already been registered')) {
      console.log(`  ⏭ ${user.email} already exists`);
      return;
    }
    throw new Error(`Failed to create ${user.email}: ${res.status} ${body}`);
  }

  const data = await res.json();
  const userId = data.id;
  console.log(`  ✓ Created ${user.email} (${userId})`);

  // Assign role (the trigger already assigns end_user, update if different)
  if (user.role !== 'end_user') {
    const roleRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        Prefer: 'return=minimal',
      },
    });
    // Update role via direct SQL through PostgREST
    // The trigger creates end_user, we need to update to the correct role
    await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        role_id: `(select id from role_definitions where name = '${user.role}')`,
      }),
    });
    console.log(`    → Role: ${user.role}`);
  }

  // Update profile status if not active
  if (user.status !== 'active' && user.status !== 'unverified') {
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        account_status: user.status,
        ...(user.status === 'suspended' ? { suspended_at: new Date().toISOString(), suspended_reason: 'Test suspension' } : {}),
        ...(user.status === 'deactivated' ? { deactivated_at: new Date().toISOString() } : {}),
      }),
    });
    console.log(`    → Status: ${user.status}`);
  }
}

async function main(): Promise<void> {
  console.log('Seeding test users...\n');

  for (const user of TEST_USERS) {
    try {
      await createUser(user);
    } catch (err) {
      console.error(`  ✗ ${user.email}: ${err}`);
    }
  }

  console.log('\nDone!');
}

main();
