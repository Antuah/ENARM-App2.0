import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import { mkdir, readdir, readFile, open, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export async function createDatabase(config, { memory = false } = {}) {
  if ((config.databaseUrl || config.databaseHost) && !memory) {
    const pool = new pg.Pool({
      ...(config.databaseUrl
        ? { connectionString: config.databaseUrl }
        : {
            host: config.databaseHost,
            port: config.databasePort,
            user: config.databaseUser,
            password: config.databasePassword,
            database: config.databaseName,
          }),
      max: 10,
      connectionTimeoutMillis: 5000,
      ...(config.databaseSsl ? { ssl: { rejectUnauthorized: true } } : {}),
    });
    pool.on("error", () => {
      /* Individual queries surface sanitized errors to the API. */
    });
    try {
      await pool.query("SELECT 1");
    } catch (error) {
      await pool.end();
      throw error;
    }
    return {
      engine: "postgresql",
      query: (sql, params = []) => pool.query(sql, params),
      exec: (sql) => pool.query(sql),
      close: () => pool.end(),
      async transaction(fn) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const result = await fn({
            query: (sql, params = []) => client.query(sql, params),
            exec: (sql) => client.query(sql),
          });
          await client.query("COMMIT");
          return result;
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        } finally {
          client.release();
        }
      },
    };
  }
  let release = async () => {};
  if (!memory) {
    await mkdir(config.dataDir, { recursive: true, mode: 0o700 });
    const lockPath = resolve(config.dataDir, ".pglite.lock");
    try {
      const lock = await open(lockPath, "wx", 0o600);
      await lock.writeFile(String(process.pid));
      await lock.close();
      release = () => unlink(lockPath).catch(() => {});
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      throw new Error(
        "La base PGlite tiene un proceso asignado. Detén npm run dev antes de usar el CLI. Si hubo un cierre abrupto, verifica que no siga abierto y elimina server/data/.pglite.lock; para varios procesos usa PostgreSQL.",
      );
    }
  }
  const db = new PGlite(
    memory ? "memory://" : resolve(config.dataDir, "postgres"),
  );
  try {
    await db.waitReady;
  } catch (error) {
    await release();
    throw error;
  }
  return {
    engine: "pglite",
    query: (sql, params = []) => db.query(sql, params),
    exec: (sql) => db.exec(sql),
    transaction: (fn) =>
      db.transaction((tx) =>
        fn({
          query: (sql, params = []) => tx.query(sql, params),
          exec: (sql) => tx.exec(sql),
        }),
      ),
    close: async () => {
      try {
        await db.close();
      } finally {
        await release();
      }
    },
  };
}

export async function migrate(db) {
  const dir = fileURLToPath(new URL("./migrations/", import.meta.url));
  await db.transaction(async (tx) => {
    if (db.engine === "postgresql")
      await tx.query("SELECT pg_advisory_xact_lock(82351047)");
    await tx.exec(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const { rows } = await tx.query("SELECT name FROM schema_migrations");
    const applied = new Set(rows.map((r) => r.name));
    for (const name of (await readdir(dir))
      .filter((n) => n.endsWith(".sql"))
      .sort()) {
      if (applied.has(name)) continue;
      await tx.exec(await readFile(resolve(dir, name), "utf8"));
      await tx.query("INSERT INTO schema_migrations(name) VALUES ($1)", [name]);
    }
  });
}
