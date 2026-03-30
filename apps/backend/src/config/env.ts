import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { z } from "zod";

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(currentDir, "../../../..");
const defaultDbPath = resolve(projectRoot, "apps/backend/data/printer-monitor.sqlite");

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(projectRoot, ".env"),
  resolve(process.cwd(), "../.env")
];

for (const candidate of envCandidates) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: false });
  }
}

const booleanSchema = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    return value.toLowerCase() === "true";
  });

const nullableIntSchema = z
  .union([z.string(), z.number(), z.undefined(), z.null()])
  .transform((value) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
  });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  HOST: z.string().default("0.0.0.0"),
  DB_PATH: z.string().default(defaultDbPath),
  POLL_INTERVAL_SECONDS: z.coerce.number().int().min(60).default(300),
  TONER_WARNING_THRESHOLD: z.coerce.number().int().min(1).max(99).default(15),
  HISTORY_RETENTION_DAYS: nullableIntSchema.default(90),
  POLL_CONCURRENCY: z.coerce.number().int().min(1).max(10).default(2),
  SNMP_TIMEOUT_MS: z.coerce.number().int().min(500).default(3000),
  SNMP_RETRIES: z.coerce.number().int().min(0).max(5).default(1),
  SNMP_MAX_REPETITIONS: z.coerce.number().int().min(5).max(50).default(20),
  SNMP_MOCK_MODE: booleanSchema.default(false),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
});

const parsed = envSchema.parse({
  ...process.env,
  DB_PATH: process.env.DB_PATH ?? defaultDbPath
});

export const env = {
  nodeEnv: parsed.NODE_ENV,
  port: parsed.PORT,
  host: parsed.HOST,
  dbPath: parsed.DB_PATH,
  pollIntervalSeconds: parsed.POLL_INTERVAL_SECONDS,
  tonerWarningThreshold: parsed.TONER_WARNING_THRESHOLD,
  historyRetentionDays: parsed.HISTORY_RETENTION_DAYS,
  pollConcurrency: parsed.POLL_CONCURRENCY,
  snmpTimeoutMs: parsed.SNMP_TIMEOUT_MS,
  snmpRetries: parsed.SNMP_RETRIES,
  snmpMaxRepetitions: parsed.SNMP_MAX_REPETITIONS,
  snmpMockMode: parsed.SNMP_MOCK_MODE,
  logLevel: parsed.LOG_LEVEL,
  projectRoot,
  frontendDistDir: resolve(projectRoot, "apps/frontend/dist")
} as const;
