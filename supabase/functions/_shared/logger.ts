/**
 * Shared structured logger for Supabase Edge Functions.
 *
 * Usage:
 *   import { createLogger } from "../_shared/logger.ts";
 *   const logger = createLogger("my-function");
 *   logger.info(req, "Something happened", { extra: "data" });
 *
 * Output (JSON per line):
 *   {"level":"INFO","message":"Something happened","functionName":"my-function",
 *    "correlationId":"...","timestamp":"...","extra":"data"}
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LogEntry {
  level: LogLevel;
  message: string;
  functionName: string;
  correlationId: string;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Extract or generate a correlation ID from a request.
 * Falls back to crypto.randomUUID() if no header is present.
 */
export function getCorrelationId(req: Request): string {
  return req.headers.get("x-correlation-id") ?? crypto.randomUUID();
}

/**
 * Redact PII fields from log extra data.
 * Masks email addresses, phone numbers, and IP addresses.
 */
function redactPII(data: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== "string") {
      redacted[key] = value;
      continue;
    }

    const lowerKey = key.toLowerCase();

    // Redact email: show first 2 chars + ***@domain
    if (lowerKey.includes("email") && value.includes("@")) {
      const [local, domain] = value.split("@");
      redacted[key] = `${local.slice(0, 2)}***@${domain}`;
      continue;
    }

    // Redact phone: show last 4 digits
    if (lowerKey.includes("phone")) {
      redacted[key] = `***${value.slice(-4)}`;
      continue;
    }

    // Redact IP: show first octet only
    if (lowerKey === "ip" || lowerKey === "ip_address") {
      const firstDot = value.indexOf(".");
      if (firstDot > 0) {
        redacted[key] = `${value.slice(0, firstDot)}.***`;
        continue;
      }
    }

    redacted[key] = value;
  }
  return redacted;
}

export interface Logger {
  debug(correlationId: string, message: string, extra?: Record<string, unknown>): void;
  info(correlationId: string, message: string, extra?: Record<string, unknown>): void;
  warn(correlationId: string, message: string, extra?: Record<string, unknown>): void;
  error(correlationId: string, message: string, extra?: Record<string, unknown>): void;
}

/**
 * Create a structured logger bound to a specific Edge Function name.
 *
 * @param functionName - The name of the Edge Function (e.g., "validate-signup")
 * @returns Logger with info, warn, error, and debug methods
 */
export function createLogger(functionName: string): Logger {
  function log(
    level: LogLevel,
    correlationId: string,
    message: string,
    extra: Record<string, unknown> = {},
  ): void {
    const entry: LogEntry = {
      level,
      message,
      functionName,
      correlationId,
      timestamp: new Date().toISOString(),
      ...redactPII(extra),
    };

    const serialized = JSON.stringify(entry);

    switch (level) {
      case "ERROR":
        console.error(serialized);
        break;
      case "WARN":
        console.warn(serialized);
        break;
      case "DEBUG":
        console.debug(serialized);
        break;
      default:
        console.info(serialized);
        break;
    }
  }

  return {
    debug: (correlationId, message, extra) => log("DEBUG", correlationId, message, extra),
    info: (correlationId, message, extra) => log("INFO", correlationId, message, extra),
    warn: (correlationId, message, extra) => log("WARN", correlationId, message, extra),
    error: (correlationId, message, extra) => log("ERROR", correlationId, message, extra),
  };
}
