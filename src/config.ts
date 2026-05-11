import { z } from "zod";

const envSchema = z.object({
  PINGCODE_BASE_URL: z.string().url().default("https://open.pingcode.com"),
  PINGCODE_ACCESS_TOKEN: z.string().optional(),
  PINGCODE_CLIENT_ID: z.string().optional(),
  PINGCODE_CLIENT_SECRET: z.string().optional(),
  PINGCODE_TOKEN_REFRESH_SKEW_SECONDS: z.coerce.number().int().positive().default(3600),
});

export type Config = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const config = envSchema.parse(env);

  if (!config.PINGCODE_ACCESS_TOKEN && (!config.PINGCODE_CLIENT_ID || !config.PINGCODE_CLIENT_SECRET)) {
    throw new Error(
      "Set PINGCODE_ACCESS_TOKEN or both PINGCODE_CLIENT_ID and PINGCODE_CLIENT_SECRET.",
    );
  }

  return {
    ...config,
    PINGCODE_BASE_URL: config.PINGCODE_BASE_URL.replace(/\/+$/, ""),
  };
}
