import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createLogger, getCorrelationId } from "../_shared/logger.ts";

const logger = createLogger("export-data");

Deno.serve(async (req: Request) => {
  const correlationId = getCorrelationId(req);

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ data: null, errors: [{ code: 'METHOD_NOT_ALLOWED', message: 'GET only' }], meta: { timestamp: new Date().toISOString(), correlationId } }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ data: null, errors: [{ code: 'UNAUTHORIZED', message: 'Missing authorization' }], meta: { timestamp: new Date().toISOString(), correlationId } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ data: null, errors: [{ code: 'UNAUTHORIZED', message: 'Invalid token' }], meta: { timestamp: new Date().toISOString(), correlationId } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  logger.info(correlationId, 'Data export requested', { user_id: user.id });

  const [profile, consents, roles] = await Promise.all([
    userClient.from('profiles').select('display_name, avatar_url, bio, phone, timezone, preferred_language, created_at').eq('id', user.id).single(),
    userClient.from('consent_entries').select('consent_type, value, ip_address, user_agent, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    userClient.from('v_user_with_role').select('role_name').eq('id', user.id).single(),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    user: { email: user.email, ...profile.data },
    role: roles.data?.role_name,
    consent_history: consents.data,
  };

  logger.info(correlationId, 'Data export completed', { user_id: user.id });

  return new Response(JSON.stringify({ data: exportData, errors: [], meta: { timestamp: new Date().toISOString(), correlationId } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
});
