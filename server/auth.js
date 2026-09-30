import { randomUUID } from "node:crypto";
import {
  registerInput,
  loginInput,
  profileInput,
  emailInput,
  resetInput,
} from "./validation.js";
import {
  ApiError,
  hashPassword,
  verifyPassword,
  randomToken,
  tokenHash,
} from "./security.js";
import { publicProfile } from "./state.js";

export async function authRoutes(app, { db, config, mailer }) {
  const cookieName = config.production
    ? "__Host-entrenarme"
    : "entrenarme_session";
  const cookieBase = {
    path: "/",
    httpOnly: true,
    secure: config.production,
    sameSite: "lax",
  };
  const dummyHash = await hashPassword(randomToken());
  const limited = { rateLimit: { max: 10, timeWindow: "15 minutes" } };
  async function issue(tx, user, remember, reply) {
    const token = randomToken();
    const csrf = randomToken();
    const seconds = remember ? 30 * 86400 : 86400;
    await tx.query("DELETE FROM auth_sessions WHERE expires_at < now()");
    await tx.query(
      "INSERT INTO auth_sessions(token_hash,user_id,csrf_token,expires_at) VALUES($1,$2,$3,$4)",
      [tokenHash(token), user.id, csrf, new Date(Date.now() + seconds * 1000)],
    );
    reply.setCookie(cookieName, token, {
      ...cookieBase,
      ...(remember ? { maxAge: seconds } : {}),
    });
    return { profile: publicProfile(user), csrfToken: csrf };
  }
  app.addHook("preHandler", async (request) => {
    if (!request.routeOptions.config.auth) return;
    const token = request.cookies[cookieName];
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token))
      throw new ApiError(
        401,
        "Inicia sesión para continuar.",
        "UNAUTHENTICATED",
      );
    const { rows } = await db.query(
      "SELECT u.*,s.token_hash,s.csrf_token FROM auth_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at > now()",
      [tokenHash(token)],
    );
    if (!rows[0])
      throw new ApiError(
        401,
        "Tu sesión terminó. Inicia sesión de nuevo.",
        "UNAUTHENTICATED",
      );
    request.user = rows[0];
    if (
      !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
      request.headers["x-csrf-token"] !== rows[0].csrf_token
    )
      throw new ApiError(
        403,
        "Actualiza la página e inténtalo de nuevo.",
        "INVALID_CSRF",
      );
  });
  app.post(
    "/api/auth/register",
    { config: limited },
    async (request, reply) => {
      const input = registerInput.parse(request.body);
      const hashed = await hashPassword(input.password);
      try {
        return await db.transaction(async (tx) => {
          const { rows } = await tx.query(
            "INSERT INTO users(id,email,password_hash,name,lastname,specialty,target) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
            [
              randomUUID(),
              input.email,
              hashed,
              input.name,
              input.lastname,
              input.specialty,
              input.target,
            ],
          );
          reply.code(201);
          return issue(tx, rows[0], false, reply);
        });
      } catch (error) {
        if (error.code === "23505")
          throw new ApiError(
            409,
            "Este correo ya tiene una cuenta. Inicia sesión o recupera tu acceso.",
            "EMAIL_EXISTS",
          );
        throw error;
      }
    },
  );
  app.post("/api/auth/login", { config: limited }, async (request, reply) => {
    const input = loginInput.parse(request.body);
    const { rows } = await db.query("SELECT * FROM users WHERE email=$1", [
      input.email,
    ]);
    const valid = await verifyPassword(
      input.password,
      rows[0]?.password_hash || dummyHash,
    );
    if (!valid || !rows[0])
      throw new ApiError(
        401,
        "El correo o la contraseña no coinciden.",
        "INVALID_CREDENTIALS",
      );
    // Lock the user to prevent a login racing a password reset from retaining old credentials.
    return db.transaction(async (tx) => {
      const { rows: current } = await tx.query(
        "SELECT * FROM users WHERE id=$1 FOR UPDATE",
        [rows[0].id],
      );
      if (current[0].password_hash !== rows[0].password_hash)
        throw new ApiError(401, "El correo o la contraseña no coinciden.");
      const old = request.cookies[cookieName];
      if (old)
        await tx.query("DELETE FROM auth_sessions WHERE token_hash=$1", [
          tokenHash(old),
        ]);
      return issue(tx, current[0], input.remember, reply);
    });
  });
  app.get("/api/auth/me", { config: { auth: true } }, async (request) => ({
    profile: publicProfile(request.user),
    csrfToken: request.user.csrf_token,
  }));
  app.post(
    "/api/auth/logout",
    { config: { auth: true } },
    async (request, reply) => {
      await db.query("DELETE FROM auth_sessions WHERE token_hash=$1", [
        request.user.token_hash,
      ]);
      reply.clearCookie(cookieName, cookieBase);
      return { ok: true };
    },
  );
  app.patch("/api/profile", { config: { auth: true } }, async (request) => {
    const input = profileInput.parse(request.body);
    const { rows } = await db.query(
      "UPDATE users SET name=COALESCE($2,name),lastname=COALESCE($3,lastname),specialty=COALESCE($4,specialty),target=COALESCE($5,target),preferences=COALESCE($6::jsonb,preferences) WHERE id=$1 RETURNING *",
      [
        request.user.id,
        input.name ?? null,
        input.lastname ?? null,
        input.specialty ?? null,
        input.target ?? null,
        input.preferences ? JSON.stringify(input.preferences) : null,
      ],
    );
    return { profile: publicProfile(rows[0]) };
  });
  app.post(
    "/api/auth/forgot-password",
    { config: { rateLimit: { max: 5, timeWindow: "15 minutes" } } },
    async (request) => {
      const { email } = emailInput.parse(request.body);
      if (!mailer.available)
        throw new ApiError(
          503,
          "La recuperación por correo aún no está disponible.",
        );
      const { rows } = await db.query("SELECT id FROM users WHERE email=$1", [
        email,
      ]);
      const token = randomToken();
      if (rows[0]) {
        const created = await db.transaction(async (tx) => {
          await tx.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [
            rows[0].id,
          ]);
          const { rows: recent } = await tx.query(
            "SELECT token_hash FROM password_resets WHERE user_id=$1 AND created_at > now() - interval '60 seconds'",
            [rows[0].id],
          );
          if (recent.length) return false;
          await tx.query("DELETE FROM password_resets WHERE user_id=$1", [
            rows[0].id,
          ]);
          await tx.query(
            "INSERT INTO password_resets(token_hash,user_id,expires_at) VALUES($1,$2,$3)",
            [
              tokenHash(token),
              rows[0].id,
              new Date(Date.now() + 30 * 60 * 1000),
            ],
          );
          return true;
        });
        if (created) {
          try {
            await mailer.sendReset(
              email,
              `${config.origin}/#/restablecer?token=${token}`,
            );
          } catch {
            await db.query("DELETE FROM password_resets WHERE token_hash=$1", [
              tokenHash(token),
            ]);
            app.log.warn(
              { event: "reset_delivery_failed" },
              "No se pudo entregar el correo de recuperación.",
            );
          }
        }
      }
      return {
        message:
          "Si el correo tiene una cuenta, recibirás un enlace para recuperar tu acceso.",
      };
    },
  );
  app.post(
    "/api/auth/reset-password",
    { config: limited },
    async (request, reply) => {
      const { token, password } = resetInput.parse(request.body);
      const hashed = await hashPassword(password);
      await db.transaction(async (tx) => {
        const { rows: found } = await tx.query(
          "SELECT user_id FROM password_resets WHERE token_hash=$1",
          [tokenHash(token)],
        );
        if (!found[0])
          throw new ApiError(
            400,
            "El enlace expiró o ya fue utilizado.",
            "INVALID_RESET",
          );
        await tx.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [
          found[0].user_id,
        ]);
        const { rows } = await tx.query(
          "UPDATE password_resets SET used_at=now() WHERE token_hash=$1 AND used_at IS NULL AND expires_at > now() RETURNING user_id",
          [tokenHash(token)],
        );
        if (!rows[0])
          throw new ApiError(
            400,
            "El enlace expiró o ya fue utilizado.",
            "INVALID_RESET",
          );
        await tx.query("UPDATE users SET password_hash=$2 WHERE id=$1", [
          rows[0].user_id,
          hashed,
        ]);
        await tx.query("DELETE FROM auth_sessions WHERE user_id=$1", [
          rows[0].user_id,
        ]);
      });
      reply.clearCookie(cookieName, cookieBase);
      return { ok: true };
    },
  );
}
