import Fastify from "fastify";
import helmet from "@fastify/helmet";
import staticFiles from "@fastify/static";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Azure serves the web only. Business data and authentication belong to Supabase.
export async function createWebHost({
  root = resolve("dist"),
  logger = true,
} = {}) {
  const app = Fastify({ logger, trustProxy: true });
  const backend = new URL(
    process.env.SUPABASE_URL || "https://oksifebzxhciydqryisi.supabase.co",
  );
  if (backend.protocol !== "https:")
    throw new Error("SUPABASE_URL debe usar HTTPS.");
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", backend.origin],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  });
  app.addHook("onSend", async (request, reply, payload) => {
    if (
      request.url === "/" ||
      request.url.startsWith("/index.html") ||
      request.url.startsWith("/api/")
    )
      reply.header("Cache-Control", "no-store");
    return payload;
  });
  app.get("/api/health", () => ({
    status: "ok",
    service: "frontend",
    backend: "supabase",
  }));
  await app.register(staticFiles, { root, wildcard: false });
  app.setNotFoundHandler((request, reply) =>
    reply
      .code(404)
      .send({
        error: { code: "NOT_FOUND", message: "No se encontró esta ruta." },
      }),
  );
  await app.ready();
  return app;
}
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  const app = await createWebHost();
  await app.listen({
    host: process.env.HOST || "0.0.0.0",
    port: Number(process.env.PORT || 3001),
  });
  for (const signal of ["SIGTERM", "SIGINT"])
    process.once(signal, async () => {
      await app.close();
      process.exit(0);
    });
}
