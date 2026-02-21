import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createLogger, getCorrelationId } from "../_shared/logger.ts";

const logger = createLogger("validate-signup");

const DISPOSABLE_DOMAINS: string[] = await (async () => {
  try {
    const data = await Deno.readTextFile(new URL('./disposable-domains.json', import.meta.url));
    return JSON.parse(data);
  } catch {
    return ['tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com', 'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'dispostable.com', 'trashmail.com'];
  }
})();

interface SignupValidationRequest {
  email: string;
  password: string;
}

interface ValidationError {
  field: string;
  code: string;
  message: string;
}

interface ValidationResponse {
  data: { valid: boolean } | null;
  errors: ValidationError[];
  meta: { timestamp: string; correlationId: string };
}

function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (password.length < 8) {
    errors.push({ field: 'password', code: 'PASSWORD_TOO_SHORT', message: 'Password must be at least 8 characters' });
  }
  if (!/[A-Z]/.test(password)) {
    errors.push({ field: 'password', code: 'PASSWORD_NO_UPPERCASE', message: 'Password must contain at least one uppercase letter' });
  }
  if (!/[a-z]/.test(password)) {
    errors.push({ field: 'password', code: 'PASSWORD_NO_LOWERCASE', message: 'Password must contain at least one lowercase letter' });
  }
  if (!/\d/.test(password)) {
    errors.push({ field: 'password', code: 'PASSWORD_NO_DIGIT', message: 'Password must contain at least one number' });
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push({ field: 'password', code: 'PASSWORD_NO_SPECIAL', message: 'Password must contain at least one special character' });
  }

  return errors;
}

function validateEmail(email: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', code: 'INVALID_EMAIL', message: 'Please enter a valid email address' });
    return errors;
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
    errors.push({ field: 'email', code: 'DISPOSABLE_EMAIL', message: 'Disposable email addresses are not allowed' });
  }

  return errors;
}

Deno.serve(async (req: Request) => {
  const correlationId = getCorrelationId(req);

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      data: null,
      errors: [{ field: '_', code: 'METHOD_NOT_ALLOWED', message: 'Only POST requests are accepted' }],
      meta: { timestamp: new Date().toISOString(), correlationId },
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: SignupValidationRequest = await req.json();

    logger.info(correlationId, 'Signup validation request', {
      email_domain: body.email?.split('@')[1],
    });

    const errors: ValidationError[] = [
      ...validateEmail(body.email),
      ...validatePassword(body.password),
    ];

    const valid = errors.length === 0;

    if (!valid) {
      logger.warn(correlationId, 'Signup validation failed', {
        error_count: errors.length,
        error_codes: errors.map(e => e.code),
      });
    }

    return new Response(JSON.stringify({
      data: { valid },
      errors,
      meta: { timestamp: new Date().toISOString(), correlationId },
    } satisfies ValidationResponse), {
      status: valid ? 200 : 422,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error(correlationId, 'Signup validation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return new Response(JSON.stringify({
      data: null,
      errors: [{ field: '_', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }],
      meta: { timestamp: new Date().toISOString(), correlationId },
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
