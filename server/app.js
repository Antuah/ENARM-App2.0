import Fastify from "fastify";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import staticFiles from "@fastify/static";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { createDatabase, migrate } from "./db.js";
import { seedSampleBank } from "./bank.js";
import { createMailer } from "./mailer.js";
import { ApiError } from "./security.js";
import { authRoutes } from "./auth.js";
import { trainingRoutes } from "./training.js";
import { bootstrap, getStats, getCatalog } from "./state.js";

export async function createApp({
  config = loadConfig(),
  db: injectedDb,
  mailer = createMailer(config),
  logger = true,
  serveStatic = config.serveFrontend,
} = {}) {
  const db = injectedDb || (await createDatabase(config));
  try {
    await migrate(db);
    if (config.sampleBank) await seedSampleBank(db);
    const app = Fastify({
      logger: logger
        ? {
            redact: [
              "req.headers.cookie",
              "req.headers.authorization",
              "req.body.password",
              "req.body.token",
              "res.headers.set-cookie",
            ],
          }
        : false,
      trustProxy: config.trustProxy,
      bodyLimit: 64 * 1024,
      requestTimeout: 15000,
    });
    app.decorateRequest("user", null);
    app.addHook("onClose", () => db.close());
    await app.register(cookie);
    await app.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          ...(config.production
            ? { upgradeInsecureRequests: [] }
            : { upgradeInsecureRequests: null }),
        },
      },
    });
    await app.register(rateLimit, {
      global: true,
      max: 300,
      timeWindow: "1 minute",
    });
    app.setErrorHandler((error, request, reply) => {
      if (error instanceof z.ZodError) {
        const passwordIssue = error.issues.some((i) =>
          i.path.includes("password"),
        );
        return reply.code(400).send({
          error: {
            code: "VALIDATION_ERROR",
            message: passwordIssue
              ? "La contraseña debe tener entre 10 y 128 caracteres."
              : "Revisa los datos ingresados.",
            fields: [...new Set(error.issues.map((i) => i.path.join(".")))],
          },
        });
      }
      const status =
        error.statusCode && error.statusCode >= 400 && error.statusCode < 500
          ? error.statusCode
          : error instanceof ApiError
            ? error.statusCode
            : 500;
      if (status >= 500)
        app.log.error(
          {
            event: "request_failed",
            requestId: request.id,
            errorCode: error.code || "INTERNAL_ERROR",
          },
          "No se pudo completar la solicitud.",
        );
      return reply.code(status).send({
        error: {
          code: error.code || "REQUEST_ERROR",
          message:
            status >= 500
              ? "No se pudo completar la solicitud. Inténtalo de nuevo."
              : status === 429
                ? "Demasiados intentos. Espera un momento antes de volver a intentar."
                : error instanceof ApiError
                  ? error.message
                  : "La solicitud no es válida.",
        },
      });
    });
    app.addHook("onRequest", async (request, reply) => {
      if (request.url.startsWith("/api/"))
        reply.header("Cache-Control", "no-store");
      if (
        request.url.startsWith("/api/") &&
        !["GET", "HEAD", "OPTIONS"].includes(request.method)
      ) {
        if (request.headers["sec-fetch-site"] === "cross-site")
          throw new ApiError(
            403,
            "La solicitud proviene de un sitio no permitido.",
            "INVALID_ORIGIN",
          );
        const origin = request.headers.origin;
        if (origin && origin !== config.origin)
          throw new ApiError(
            403,
            "La solicitud proviene de un sitio no permitido.",
            "INVALID_ORIGIN",
          );
      }
    });
    await authRoutes(app, { db, config, mailer });
    trainingRoutes(app, { db, config });
    app.get("/api/health", { config: { rateLimit: false } }, async () => {
      await db.query("SELECT 1");
      return { status: "ok" };
    });
    app.get("/api/bootstrap", { config: { auth: true } }, (request) =>
      bootstrap(db, request.user),
    );
    app.get("/api/catalog", { config: { auth: true } }, () => getCatalog(db));
    app.get("/api/stats", { config: { auth: true } }, (request) =>
      getStats(
        db,
        request.user.id,
        z.enum(["week", "month"]).parse(request.query.period || "week"),
      ),
    );
    app.get("/api/plans", () => ({
      plans: [
        { id: "basic", name: "Básico", available: true, dailyTokens: 10 },
        { id: "premium", name: "Premium", available: false },
      ],
      billingEnabled: false,
    }));
    if (serveStatic) {
      const root = resolve("dist");
      if (!existsSync(resolve(root, "index.html")))
        throw new Error(
          "Ejecuta npm run build antes de iniciar el servidor de producción.",
        );
      await app.register(staticFiles, { root, prefix: "/", wildcard: false });
    }
    app.setNotFoundHandler((request, reply) =>
      reply.code(404).send({
        error: { code: "NOT_FOUND", message: "No se encontró esta ruta." },
      }),
    );
    await app.ready();
    return app;
  } catch (error) {
    await db.close();
    throw error;
  }
}
