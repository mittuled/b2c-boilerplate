/**
 * Doctor CLI — integration tests
 *
 * Runs the doctor.sh script in a controlled sub-shell and asserts on
 * stdout content and exit codes.
 */
import { describe, it, expect } from "vitest";
import { execSync, ExecSyncOptions } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");
const DOCTOR = path.resolve(__dirname, "../doctor.sh");

/** Run doctor.sh and return { stdout, exitCode }. Never throws. */
function runDoctor(
  envOverrides: Record<string, string> = {},
): { stdout: string; exitCode: number } {
  const opts: ExecSyncOptions = {
    cwd: ROOT,
    env: { ...process.env, ...envOverrides },
    // Pipe stdout so we can capture it; inherit stderr for debugging
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 30_000,
  };

  try {
    const stdout = execSync(`bash "${DOCTOR}"`, opts).toString();
    return { stdout, exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: Buffer; status?: number };
    return {
      stdout: e.stdout?.toString() ?? "",
      exitCode: e.status ?? 1,
    };
  }
}

/* -------------------------------------------------------------------------- */
/*  Tests                                                                      */
/* -------------------------------------------------------------------------- */

describe("doctor.sh", () => {
  it("checks for Node.js version", () => {
    const { stdout } = runDoctor();
    expect(stdout).toContain("Node.js");
  });

  it("checks for pnpm", () => {
    const { stdout } = runDoctor();
    expect(stdout).toContain("pnpm");
  });

  it("checks for Supabase CLI", () => {
    const { stdout } = runDoctor();
    expect(stdout).toContain("Supabase CLI");
  });

  it("checks for .env file", () => {
    const { stdout } = runDoctor();
    // Should mention .env.local, .env, or warn about missing env
    expect(stdout).toMatch(/\.env/);
  });

  it("outputs a formatted summary section", () => {
    const { stdout } = runDoctor();
    expect(stdout).toContain("Summary");
  });

  it("outputs section headers", () => {
    const { stdout } = runDoctor();
    expect(stdout).toContain("Runtime");
    expect(stdout).toContain("Supabase");
    expect(stdout).toContain("Environment");
    expect(stdout).toContain("Services");
  });

  it("exits with code 0 or 1 (never crashes)", () => {
    const { exitCode } = runDoctor();
    expect([0, 1]).toContain(exitCode);
  });
});
