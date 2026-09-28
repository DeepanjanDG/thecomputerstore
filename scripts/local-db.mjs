// Starts a local PostgreSQL server for development (no Docker / system install needed).
// Data lives in ./.pgdata. Production should point DATABASE_URL at a managed PostgreSQL.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import path from "node:path";

const dataDir = path.resolve(".pgdata");
const port = Number(process.env.LOCAL_PG_PORT ?? 5433);
const dbName = "thecomputerstore";

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

const fresh = !existsSync(path.join(dataDir, "PG_VERSION"));
if (fresh) await pg.initialise();
await pg.start();
try {
  await pg.createDatabase(dbName);
} catch {
  // database already exists
}

console.log(`PostgreSQL ready: postgresql://postgres:postgres@localhost:${port}/${dbName}`);

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
