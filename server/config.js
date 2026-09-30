import { resolve } from "node:path";

export function loadConfig(overrides = {}) {
  const production = process.env.NODE_ENV === "production";
  const config = {
    production,
    host: process.env.HOST || (production ? "0.0.0.0" : "127.0.0.1"),
    port: Number(process.env.PORT || 3001),
    origin: new URL(process.env.APP_ORIGIN || "http://127.0.0.1:5173").origin,
    databaseUrl: process.env.DATABASE_URL || "",
    databaseHost: process.env.PGHOST || "",
    databasePort: Number(process.env.PGPORT || 5432),
    databaseUser: process.env.PGUSER || "",
    databasePassword: process.env.PGPASSWORD || "",
    databaseName: process.env.PGDATABASE || "entrenarme",
    databaseSsl: process.env.DATABASE_SSL === "true",
    dataDir: resolve(process.env.DATA_DIR || "server/data"),
    sampleBank:
      process.env.SEED_SAMPLE_BANK === "true" ||
      (!production && process.env.SEED_SAMPLE_BANK !== "false"),
    smtpHost: process.env.SMTP_HOST || "",
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpSecure: process.env.SMTP_SECURE === "true",
    smtpUser: process.env.SMTP_USER || "",
    smtpPassword: process.env.SMTP_PASSWORD || "",
    mailFrom: process.env.MAIL_FROM || "Entrenarme <no-reply@example.com>",
    trustProxy: process.env.TRUST_PROXY === "true",
    serveFrontend:
      process.env.SERVE_FRONTEND === undefined
        ? production
        : process.env.SERVE_FRONTEND === "true",
    ...overrides,
  };
  if (config.production && !config.databaseUrl && !config.databaseHost)
    throw new Error(
      "En producción se requiere DATABASE_URL o PGHOST de PostgreSQL.",
    );
  if (
    config.databaseHost &&
    (!Number.isInteger(config.databasePort) ||
      config.databasePort < 1 ||
      config.databasePort > 65535)
  )
    throw new Error("PGPORT no es válido.");
  if (config.databaseSsl && config.databaseUrl) {
    const params = new URL(config.databaseUrl).searchParams;
    if (
      ["sslmode", "sslcert", "sslkey", "sslrootcert"].some((name) =>
        params.has(name),
      )
    )
      throw new Error(
        "Usa DATABASE_SSL=true sin parámetros SSL en DATABASE_URL, o configura los campos PGHOST/PGUSER/PGPASSWORD por separado.",
      );
  }
  if (config.production && !config.origin.startsWith("https://"))
    throw new Error("En producción APP_ORIGIN debe usar HTTPS.");
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535)
    throw new Error("PORT no es válido.");
  return config;
}
