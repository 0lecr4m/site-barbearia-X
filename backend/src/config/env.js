import { z } from "zod";
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  APP_TIMEZONE: z.string().default("America/Sao_Paulo"),
  SLOT_INTERVAL_MINUTES: z.coerce.number().int().min(5).max(60).default(15),
  CANCELLATION_NOTICE_HOURS: z.coerce.number().min(0).default(2),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success)
  throw new Error(
    `Configuração inválida: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`,
  );
export const env = parsed.data;
