import { z, ZodError } from "zod";

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export const secretEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export const fullEnvSchema = publicEnvSchema.merge(secretEnvSchema);

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type SecretEnv = z.infer<typeof secretEnvSchema>;
export type FullEnv = z.infer<typeof fullEnvSchema>;

export function validateEnv(): FullEnv {
  try {
    return fullEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues.map(
        (issue) => `Missing or invalid: ${issue.path.join(".")} - ${issue.message}`
      );
      throw new Error(messages.join("\n"));
    }
    throw error;
  }
}

export function validatePublicEnv(): PublicEnv {
  try {
    return publicEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues.map(
        (issue) => `Missing or invalid: ${issue.path.join(".")} - ${issue.message}`
      );
      throw new Error(messages.join("\n"));
    }
    throw error;
  }
}
