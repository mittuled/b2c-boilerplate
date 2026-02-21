/**
 * @b2c/env-validation - Integration tests
 *
 * Validates that Zod schemas correctly accept, reject,
 * and default environment variable values.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  publicEnvSchema,
  secretEnvSchema,
  fullEnvSchema,
  validateEnv,
  validatePublicEnv,
} from "../src/index";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

const VALID_PUBLIC_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
};

const VALID_SECRET_ENV = {
  SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service",
};

const VALID_FULL_ENV = { ...VALID_PUBLIC_ENV, ...VALID_SECRET_ENV };

/* -------------------------------------------------------------------------- */
/*  Public env schema                                                          */
/* -------------------------------------------------------------------------- */

describe("publicEnvSchema", () => {
  it("accepts valid public env vars", () => {
    const result = publicEnvSchema.safeParse(VALID_PUBLIC_ENV);
    expect(result.success).toBe(true);
  });

  it("rejects when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_ANON_KEY: VALID_PUBLIC_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("NEXT_PUBLIC_SUPABASE_URL");
    }
  });

  it("rejects invalid URL format for NEXT_PUBLIC_SUPABASE_URL", () => {
    const result = publicEnvSchema.safeParse({
      ...VALID_PUBLIC_ENV,
      NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("url");
    }
  });

  it("rejects empty string for NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
    const result = publicEnvSchema.safeParse({
      ...VALID_PUBLIC_ENV,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
    });
    expect(result.success).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  Secret env schema                                                          */
/* -------------------------------------------------------------------------- */

describe("secretEnvSchema", () => {
  it("accepts valid secret env vars", () => {
    const result = secretEnvSchema.safeParse(VALID_SECRET_ENV);
    expect(result.success).toBe(true);
  });

  it("rejects when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
    const result = secretEnvSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("SUPABASE_SERVICE_ROLE_KEY");
    }
  });

  it("rejects empty string for SUPABASE_SERVICE_ROLE_KEY", () => {
    const result = secretEnvSchema.safeParse({
      SUPABASE_SERVICE_ROLE_KEY: "",
    });
    expect(result.success).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  Full env schema                                                            */
/* -------------------------------------------------------------------------- */

describe("fullEnvSchema", () => {
  it("accepts a complete valid env", () => {
    const result = fullEnvSchema.safeParse(VALID_FULL_ENV);
    expect(result.success).toBe(true);
  });

  it("rejects when any required var is missing", () => {
    const { SUPABASE_SERVICE_ROLE_KEY, ...incomplete } = VALID_FULL_ENV;
    const result = fullEnvSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("strips unknown keys (passthrough not enabled)", () => {
    const result = fullEnvSchema.safeParse({
      ...VALID_FULL_ENV,
      RANDOM_EXTRA: "should-be-stripped",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("RANDOM_EXTRA");
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  validateEnv() helper                                                       */
/* -------------------------------------------------------------------------- */

describe("validateEnv()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...VALID_FULL_ENV };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns parsed env when all required vars are present", () => {
    const env = validateEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe(VALID_FULL_ENV.NEXT_PUBLIC_SUPABASE_URL);
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe(VALID_FULL_ENV.SUPABASE_SERVICE_ROLE_KEY);
  });

  it("throws a descriptive error when vars are missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => validateEnv()).toThrowError(/Missing or invalid/);
  });

  it("error message contains the name of every missing variable", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    try {
      validateEnv();
      expect.unreachable("should have thrown");
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect(message).toContain("SUPABASE_SERVICE_ROLE_KEY");
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  validatePublicEnv() helper                                                 */
/* -------------------------------------------------------------------------- */

describe("validatePublicEnv()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ...VALID_FULL_ENV };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns only public env vars", () => {
    const env = validatePublicEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe(VALID_FULL_ENV.NEXT_PUBLIC_SUPABASE_URL);
    expect(env).not.toHaveProperty("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("throws when a public var has an invalid URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";
    expect(() => validatePublicEnv()).toThrowError(/Missing or invalid/);
  });
});
