import { app } from "./app.js";
import { db } from "./config/database.js";
import { env } from "./config/env.js";
try {
  await db.query("SELECT 1");
} catch (error) {
  console.error("Não foi possível conectar ao PostgreSQL:", error.message);
  console.error("Confira DATABASE_URL, DATABASE_SSL e se está usando o Session Pooler do Supabase.");
  await db.end();
  process.exit(1);
}
const server = app.listen(env.PORT, () =>
  console.log(`API disponível em http://localhost:${env.PORT}`),
);
async function shutdown(signal) {
  console.log(`${signal}: encerrando...`);
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
