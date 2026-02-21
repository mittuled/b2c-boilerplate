import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  parsePaginationParams,
  buildPaginatedResponse,
} from "../_shared/pagination.ts";
import { createLogger, getCorrelationId } from "../_shared/logger.ts";

const logger = createLogger("manage-sessions");

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function jsonResponse(
  data: unknown,
  status: number,
  correlationId: string,
) {
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

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const correlationId = getCorrelationId(req);
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return errorResponse(
      [{ code: "UNAUTHORIZED", message: "Missing authorization header" }],
      401,
      correlationId,
    );
  }

  const userClient = createClient(
    supabaseUrl,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return errorResponse(
      [{ code: "UNAUTHORIZED", message: "Invalid token" }],
      401,
      correlationId,
    );
  }

  const url = new URL(req.url);

  // ── GET: List user's sessions with cursor pagination ─────────────
  if (req.method === "GET") {
    logger.info(correlationId, "List sessions", { user_id: user.id });

    const { cursor, limit } = parsePaginationParams(url);

    const { data: sessions, error } = await userClient.rpc("get_my_sessions");
    if (error) {
      logger.error(correlationId, "Failed to list sessions", {
        error: error.message,
      });
      return errorResponse(
        [{ code: "INTERNAL_ERROR", message: error.message }],
        500,
        correlationId,
      );
    }

    // Get current session ID from JWT
    const {
      data: { session: currentSession },
    } = await userClient.auth.getSession();

    let currentSessionId: string | null = null;
    if (currentSession?.access_token) {
      try {
        const payload = JSON.parse(
          atob(currentSession.access_token.split(".")[1]),
        );
        currentSessionId = payload.session_id ?? null;
      } catch {
        // Unable to decode JWT — leave currentSessionId as null
      }
    }

    // Enrich sessions with is_current flag
    const enriched = (sessions || []).map((s: Record<string, unknown>) => ({
      ...s,
      is_current: s.session_id === currentSessionId,
    }));

    // Apply cursor-based pagination
    let startIndex = 0;
    if (cursor) {
      const idx = enriched.findIndex(
        (s: Record<string, unknown>) => s.session_id === cursor,
      );
      if (idx !== -1) {
        startIndex = idx + 1;
      }
    }

    // Slice limit + 1 to detect hasMore
    const sliced = enriched.slice(startIndex, startIndex + limit + 1);

    const paginated = buildPaginatedResponse(
      sliced,
      limit,
      (s: Record<string, unknown>) => s.session_id as string,
    );

    return new Response(
      JSON.stringify({
        data: paginated.items,
        errors: null,
        meta: {
          timestamp: new Date().toISOString(),
          correlationId,
          pagination: {
            nextCursor: paginated.nextCursor,
            hasMore: paginated.hasMore,
          },
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // ── DELETE: Revoke a specific session ─────────────────────────────
  if (req.method === "DELETE") {
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId) {
      return errorResponse(
        [{ code: "MISSING_PARAM", message: "session_id required" }],
        400,
        correlationId,
      );
    }

    logger.info(correlationId, "Revoke session", {
      user_id: user.id,
      session_id: sessionId,
    });

    const { error } = await adminClient.auth.admin.deleteSession(sessionId);
    if (error) {
      logger.error(correlationId, "Failed to revoke session", {
        error: error.message,
      });
      return errorResponse(
        [{ code: "REVOKE_FAILED", message: error.message }],
        500,
        correlationId,
      );
    }

    return jsonResponse({ revoked: true }, 200, correlationId);
  }

  // ── POST /force-logout: Admin force logout ───────────────────────
  if (req.method === "POST" && url.pathname.endsWith("/force-logout")) {
    let body: { user_id?: string };
    try {
      body = await req.json();
    } catch {
      return errorResponse(
        [{ code: "INVALID_BODY", message: "Request body must be valid JSON" }],
        400,
        correlationId,
      );
    }

    const targetUserId = body.user_id;
    if (!targetUserId) {
      return errorResponse(
        [{ code: "MISSING_PARAM", message: "user_id required" }],
        400,
        correlationId,
      );
    }

    // Check admin permission
    const { data: hasPermission } = await userClient.rpc("authorize", {
      requested_permission: "sessions.manage",
    });

    if (!hasPermission) {
      return errorResponse(
        [
          {
            code: "FORBIDDEN",
            message: "Requires sessions.manage permission",
          },
        ],
        403,
        correlationId,
      );
    }

    logger.warn(correlationId, "Admin force logout", {
      admin_id: user.id,
      target_user_id: targetUserId,
    });

    const { error } = await adminClient.auth.admin.signOut(
      targetUserId,
      "global",
    );
    if (error) {
      logger.error(correlationId, "Force logout failed", {
        error: error.message,
      });
      return errorResponse(
        [{ code: "FORCE_LOGOUT_FAILED", message: error.message }],
        500,
        correlationId,
      );
    }

    return jsonResponse({ logged_out: true }, 200, correlationId);
  }

  return errorResponse(
    [{ code: "METHOD_NOT_ALLOWED", message: "Method not allowed" }],
    405,
    correlationId,
  );
});
