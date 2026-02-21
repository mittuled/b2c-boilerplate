import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createLogger, getCorrelationId } from "../_shared/logger.ts";

const logger = createLogger("delete-account");

Deno.serve(async (req: Request) => {
  const correlationId = getCorrelationId(req);

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ data: null, errors: [{ code: 'METHOD_NOT_ALLOWED', message: 'POST only' }], meta: { timestamp: new Date().toISOString(), correlationId } }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ data: null, errors: [{ code: 'UNAUTHORIZED', message: 'Missing authorization' }], meta: { timestamp: new Date().toISOString(), correlationId } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ data: null, errors: [{ code: 'UNAUTHORIZED', message: 'Invalid token' }], meta: { timestamp: new Date().toISOString(), correlationId } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  logger.warn(correlationId, 'Account deletion requested', { user_id: user.id });

  // Soft-delete profile + scrub PII per data-model PII Registry
  await adminClient.from('profiles').update({
    display_name: 'Deleted User',
    avatar_url: null,
    bio: null,
    phone: null,
    deleted_at: new Date().toISOString(),
    account_status: 'deactivated',
    deactivated_at: new Date().toISOString(),
  }).eq('id', user.id);

  // Delete avatar from storage
  await adminClient.storage.from('avatars').remove([`${user.id}/`]);

  // Revoke all sessions
  await adminClient.auth.admin.signOut(user.id, 'global');

  logger.info(correlationId, 'Account deleted', { user_id: user.id });

  return new Response(JSON.stringify({ data: { deleted: true }, errors: [], meta: { timestamp: new Date().toISOString(), correlationId } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
