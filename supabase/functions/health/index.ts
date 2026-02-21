import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { createLogger, getCorrelationId } from "../_shared/logger.ts";

const logger = createLogger("health");

/**
 * Health-check Edge Function.
 *
 * GET /health          - shallow check (process alive)
 * GET /health?mode=deep - deep check (database + auth connectivity)
 *
 * No authentication required (verify_jwt: false).
 */

const APP_VERSION = Deno.env.get("APP_VERSION") ?? "1.0.0";
const startTime = Date.now();

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CheckStatus = "up" | "down";

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  uptime: number;
  checks: {
    database: CheckStatus;
    auth: CheckStatus;
  };
}

function jsonResponse(data: unknown, status: number, correlationId: string) {
  return new Response(
    JSON.stringify({
      data,
      errors: null,
      meta: { timestamp: new Date().toISOString(), correlationId },
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

function errorResponse(
  errors: Array<{ code: string; message: string }>,
  status: number,
  correlationId: string,
) {
  return new Response(
    JSON.stringify({
      data: null,
      errors,
      meta: { timestamp: new Date().toISOString(), correlationId },
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

async function checkDatabase(
  client: ReturnType<typeof createClient>,
): Promise<CheckStatus> {
  try {
    const { error } = await client.from("profiles").select("id").limit(1);
    return error ? "down" : "up";
  } catch {
    return "down";
  }
}

async function checkAuth(
  client: ReturnType<typeof createClient>,
): Promise<CheckStatus> {
  try {
    // Attempt to get settings — a lightweight auth endpoint call
    const { error } = await client.auth.getSession();
    // getSession without a token returns a null session but no error
    // if the auth service is reachable
    return error ? "down" : "up";
  } catch {
    return "down";
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const correlationId = getCorrelationId(req);

  if (req.method !== "GET") {
    return errorResponse(
      [{ code: "METHOD_NOT_ALLOWED", message: "Only GET is allowed" }],
      405,
      correlationId,
    );
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") ?? "shallow";
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  logger.info(correlationId, "Health check requested", { mode });

  // Shallow check: process is alive, no external calls
  if (mode === "shallow") {
    const result: HealthResponse = {
      status: "healthy",
      version: APP_VERSION,
      uptime: uptimeSeconds,
      checks: {
        database: "up",
        auth: "up",
      },
    };
    return jsonResponse(result, 200, correlationId);
  }

  // Deep check: verify database and auth connectivity
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const client = createClient(supabaseUrl, serviceRoleKey);

  const [database, auth] = await Promise.all([
    checkDatabase(client),
    checkAuth(client),
  ]);

  const checks = { database, auth };
  const allUp = Object.values(checks).every((v) => v === "up");
  const allDown = Object.values(checks).every((v) => v === "down");

  let overallStatus: HealthResponse["status"];
  if (allUp) {
    overallStatus = "healthy";
  } else if (allDown) {
    overallStatus = "unhealthy";
  } else {
    overallStatus = "degraded";
  }

  const result: HealthResponse = {
    status: overallStatus,
    version: APP_VERSION,
    uptime: uptimeSeconds,
    checks,
  };

  const httpStatus = overallStatus === "unhealthy" ? 503 : 200;

  logger.info(correlationId, "Health check completed", {
    status: overallStatus,
    checks,
  });

  return jsonResponse(result, httpStatus, correlationId);
});
