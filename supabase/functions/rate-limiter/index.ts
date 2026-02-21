import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createLogger, getCorrelationId } from "../_shared/logger.ts";

const logger = createLogger("rate-limiter");

/**
 * In-memory sliding-window rate limiter Edge Function.
 *
 * Can be used in two ways:
 * 1. Imported as a module: `import { checkRateLimit } from "../rate-limiter/index.ts"`
 * 2. Called as an Edge Function via POST /rate-limiter with JSON body
 *    { key, maxRequests?, windowMs? }
 *
 * Keys by user ID (from JWT) or a caller-provided key such as IP address.
 * Returns 429 Too Many Requests with a Retry-After header when the limit
 * is exceeded.
 */

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Rate limit store ────────────────────────────────────────────────

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_WINDOW_MS = 60_000; // 60 seconds

// Periodic cleanup to prevent unbounded memory growth.
// Runs every 5 minutes and evicts entries that have been fully expired.
const CLEANUP_INTERVAL_MS = 5 * 60_000;

let lastCleanup = Date.now();

function cleanupStore(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  const cutoff = now - windowMs;

  for (const [key, entry] of store) {
    // Remove all timestamps older than the window
    entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

// ── Exported rate-limit check ───────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check whether the given key is within its rate limit.
 *
 * @param key          - Unique identifier (user ID, IP, etc.)
 * @param maxRequests  - Maximum requests allowed in the window (default 100)
 * @param windowMs     - Window duration in milliseconds (default 60 000)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowMs: number = DEFAULT_WINDOW_MS,
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Evict expired timestamps for this key
  entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);

  // Determine the earliest timestamp that will expire (for Retry-After)
  const oldestInWindow = entry.timestamps[0] ?? now;
  const resetAt = oldestInWindow + windowMs;

  if (entry.timestamps.length >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  // Record this request
  entry.timestamps.push(now);

  // Best-effort background cleanup
  cleanupStore(windowMs);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetAt,
  };
}

// ── Edge Function handler ───────────────────────────────────────────

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
  extraHeaders: Record<string, string> = {},
) {
  return new Response(
    JSON.stringify({
      data: null,
      errors,
      meta: { timestamp: new Date().toISOString(), correlationId },
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        ...extraHeaders,
      },
    },
  );
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const correlationId = getCorrelationId(req);

  if (req.method !== "POST") {
    return errorResponse(
      [{ code: "METHOD_NOT_ALLOWED", message: "Only POST is allowed" }],
      405,
      correlationId,
    );
  }

  let body: {
    key?: string;
    maxRequests?: number;
    windowMs?: number;
  };

  try {
    body = await req.json();
  } catch {
    return errorResponse(
      [{ code: "INVALID_BODY", message: "Request body must be valid JSON" }],
      400,
      correlationId,
    );
  }

  // Determine the rate-limit key. Prefer explicit key, fall back to
  // user ID from JWT, then to the connecting IP.
  let key = body.key;

  if (!key) {
    // Try to extract user ID from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const payload = JSON.parse(atob(token.split(".")[1]));
        key = payload.sub ?? undefined;
      } catch {
        // Token decode failed, fall through to IP
      }
    }
  }

  if (!key) {
    // Use forwarded IP or a generic fallback
    key =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "anonymous";
  }

  const maxRequests =
    typeof body.maxRequests === "number" && body.maxRequests > 0
      ? body.maxRequests
      : DEFAULT_MAX_REQUESTS;

  const windowMs =
    typeof body.windowMs === "number" && body.windowMs > 0
      ? body.windowMs
      : DEFAULT_WINDOW_MS;

  logger.info(correlationId, "Rate limit check", {
    key,
    maxRequests,
    windowMs,
  });

  const result = checkRateLimit(key, maxRequests, windowMs);

  if (!result.allowed) {
    const retryAfterSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);

    logger.warn(correlationId, "Rate limit exceeded", {
      key,
      retryAfterSeconds,
    });

    return errorResponse(
      [{ code: "RATE_LIMITED", message: "Too many requests. Try again later." }],
      429,
      correlationId,
      {
        "Retry-After": String(Math.max(retryAfterSeconds, 1)),
        "X-RateLimit-Limit": String(maxRequests),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
      },
    );
  }

  return new Response(
    JSON.stringify({
      data: {
        allowed: result.allowed,
        remaining: result.remaining,
        resetAt: result.resetAt,
      },
      errors: null,
      meta: { timestamp: new Date().toISOString(), correlationId },
    }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(maxRequests),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
      },
    },
  );
});
