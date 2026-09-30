import { readFile } from "node:fs/promises";
import { loadConfig } from "./config.js";
import { createDatabase, migrate } from "./db.js";
import { seedSampleBank, importQuestions } from "./bank.js";
const config = loadConfig();
const db = await createDatabase(config);
try {
  const command = process.argv[2];
  if (!["migrate", "seed", "import", "check"].includes(command))
    throw new Error(
      "Comando no reconocido: usa migrate, seed, import o check.",
    );
  if (command !== "check") await migrate(db);
  if (command === "check") {
    const { rows } = await db.query(
      "SELECT current_database() AS name, (SELECT count(*)::int FROM information_schema.tables WHERE table_schema='public') AS tables",
    );
    let encrypted = false;
    if (db.engine === "postgresql") {
      const tls = await db.query(
        "SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()",
      );
      encrypted = tls.rows[0]?.ssl === true;
      if (config.databaseSsl && !encrypted)
        throw new Error("La conexión no utiliza TLS.");
    }
    console.log(
      `Conexión correcta: ${db.engine}. Base: ${rows[0].name}. Tablas públicas: ${rows[0].tables}. TLS: ${encrypted ? "activo" : "no utilizado"}.`,
    );
  } else if (command === "seed") {
    await seedSampleBank(db);
    console.log("Banco de muestra preparado.");
  } else if (command === "import") {
    if (!process.argv[3])
      throw new Error("Indica un archivo JSON con las preguntas.");
    const questions = JSON.parse(await readFile(process.argv[3], "utf8"));
    if (!Array.isArray(questions) || questions.length > 50000)
      throw new Error("Se espera un arreglo de hasta 50,000 preguntas.");
    const ids = await importQuestions(db, questions);
    console.log(`${ids.length} preguntas importadas.`);
  } else console.log("Migraciones aplicadas.");
} finally {
  await db.close();
}
