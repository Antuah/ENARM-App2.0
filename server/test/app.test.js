import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../app.js";
import { createDatabase, migrate } from "../db.js";
import { loadConfig } from "../config.js";
import { importQuestions } from "../bank.js";
import { sampleQuestions } from "../seed-questions.js";
import { tokenHash } from "../security.js";
import { localDay, shiftDay } from "../state.js";

let app, db;
const delivered = [];
const config = loadConfig({
  production: false,
  sampleBank: true,
  databaseUrl: process.env.TEST_DATABASE_URL || "",
  databaseHost: "",
});
before(async () => {
  // TEST_DATABASE_URL must be a disposable database: these tests create real accounts and bank entries.
  db = await createDatabase(config, { memory: !config.databaseUrl });
  app = await createApp({
    config,
    db,
    logger: false,
    mailer: {
      available: true,
      sendReset: async (email, url) => delivered.push({ email, url }),
    },
  });
});
after(async () => app?.close());
let ip = 0;
async function account() {
  const email = `${randomUUID()}@example.test`;
  const remoteAddress = `10.0.0.${++ip}`;
  const response = await app.inject({
    method: "POST",
    url: "/api/auth/register",
    remoteAddress,
    payload: { name: "Prueba", email, password: "testing-password" },
  });
  assert.equal(response.statusCode, 201, response.body);
  const cookie = response.cookies[0];
  const headers = {
    cookie: `${cookie.name}=${cookie.value}`,
    "x-csrf-token": response.json().csrfToken,
  };
  return {
    email,
    headers,
    remoteAddress,
    id: response.json().profile.id,
    cookie,
    call: (method, url, payload) =>
      app.inject({
        method,
        url: `/api${url}`,
        payload,
        headers,
        remoteAddress,
      }),
  };
}
async function successful(response, code = 200) {
  assert.equal(response.statusCode, code, response.body);
  return response.json();
}
async function start(user, input = {}) {
  return successful(
    await user.call("POST", "/sessions", {
      mode: "rapido",
      count: 5,
      ...input,
    }),
    201,
  );
}
const knownAnswer = (q) => sampleQuestions.find((s) => s.id === q.id).answer;
async function answerAll(user, session, wrong = false) {
  return successful(
    await user.call("PATCH", `/sessions/${session.id}`, {
      answers: Object.fromEntries(
        session.questions.map((q) => [
          q.id,
          wrong ? (knownAnswer(q) + 1) % 4 : knownAnswer(q),
        ]),
      ),
    }),
  );
}

test("authentication stores password hashes, private cookies, and rejects invalid credentials", async () => {
  const user = await account();
  const { rows } = await db.query(
    "SELECT password_hash FROM users WHERE id=$1",
    [user.id],
  );
  assert.match(rows[0].password_hash, /^scrypt\$/);
  assert.notEqual(rows[0].password_hash, "testing-password");
  assert.equal(user.cookie.httpOnly, true);
  assert.equal(user.cookie.sameSite, "Lax");
  const duplicate = await app.inject({
    method: "POST",
    url: "/api/auth/register",
    remoteAddress: user.remoteAddress,
    payload: {
      name: "Other",
      email: user.email.toUpperCase(),
      password: "testing-password",
    },
  });
  assert.equal(duplicate.statusCode, 409);
  const bad = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    remoteAddress: user.remoteAddress,
    payload: { email: user.email, password: "incorrect-password" },
  });
  assert.equal(bad.statusCode, 401);
  assert.equal((await app.inject({ url: "/api/bootstrap" })).statusCode, 401);
  const me = await successful(await user.call("GET", "/auth/me"));
  assert.equal(me.profile.email, user.email);
  assert.equal(me.profile.password_hash, undefined);
  const login = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    remoteAddress: user.remoteAddress,
    payload: {
      email: user.email,
      password: "testing-password",
      remember: true,
    },
  });
  assert.equal(login.statusCode, 200);
  assert.equal(login.cookies[0].maxAge, 30 * 86400);
});

test("CSRF, Origin, input validation, and plan escalation are enforced by API", async () => {
  const user = await account();
  assert.equal(
    (
      await app.inject({
        method: "PATCH",
        url: "/api/profile",
        headers: { cookie: user.headers.cookie },
        payload: { name: "Cambio" },
      })
    ).statusCode,
    403,
  );
  assert.equal(
    (
      await app.inject({
        method: "PATCH",
        url: "/api/profile",
        headers: { ...user.headers, origin: "https://other.example" },
        payload: { name: "Cambio" },
      })
    ).statusCode,
    403,
  );
  assert.equal(
    (await user.call("PATCH", "/profile", { plan: "Premium" })).statusCode,
    400,
  );
  assert.equal(
    (await user.call("POST", "/sessions", { mode: "rapido", count: 101 }))
      .statusCode,
    400,
  );
  assert.equal(
    (await user.call("POST", "/sessions", { mode: "personalizado", count: 5 }))
      .statusCode,
    400,
  );
  const changed = await successful(
    await user.call("PATCH", "/profile", {
      name: "Nueva",
      preferences: { reminders: false, sound: true },
    }),
  );
  assert.equal(changed.profile.name, "Nueva");
  assert.equal(changed.profile.plan, "Básico");
  const boot = await successful(await user.call("GET", "/bootstrap"));
  assert.equal(boot.preferences.sound, true);
  assert.equal(boot.stats.total, 0);
  assert.equal(boot.stats.average, null);
});

test("quizzes hide answer keys, save progress, grade server-side and isolate accounts", async () => {
  const user = await account(),
    other = await account();
  const session = await start(user);
  for (const q of session.questions) {
    assert.equal(q.answer, undefined);
    assert.equal(q.explanation, undefined);
  }
  assert.equal(
    (await other.call("GET", `/sessions/${session.id}`)).statusCode,
    404,
  );
  assert.equal(
    (await other.call("PATCH", `/sessions/${session.id}`, { current: 1 }))
      .statusCode,
    404,
  );
  assert.equal(
    (await other.call("POST", `/sessions/${session.id}/finish`)).statusCode,
    404,
  );
  assert.equal(
    (
      await user.call(
        "POST",
        `/sessions/${session.id}/questions/${session.questions[0].id}/reveal`,
      )
    ).statusCode,
    409,
  );
  assert.equal(
    (
      await user.call("PATCH", `/sessions/${session.id}`, {
        answers: { 999999: 1 },
        current: 2,
      })
    ).statusCode,
    400,
  );
  assert.equal(
    (await successful(await user.call("GET", `/sessions/${session.id}`)))
      .current,
    0,
  ); // rollback also undoes movement
  await successful(
    await user.call("PATCH", `/sessions/${session.id}`, {
      current: 2,
      answers: { [session.questions[0].id]: knownAnswer(session.questions[0]) },
    }),
  );
  const resumed = await successful(await user.call("GET", "/bootstrap"));
  assert.equal(resumed.activeSession.current, 2);
  assert.equal(
    resumed.activeSession.answers[session.questions[0].id],
    knownAnswer(session.questions[0]),
  );
  const result = await successful(
    await user.call("POST", `/sessions/${session.id}/finish`),
  );
  assert.equal(result.correct, 1);
  assert.equal(result.score, 20);
  assert.equal(result.questions[0].answer, knownAnswer(session.questions[0]));
  await successful(await user.call("POST", `/sessions/${session.id}/finish`));
  assert.equal(
    (await user.call("PATCH", `/sessions/${session.id}`, { current: 0 }))
      .statusCode,
    409,
  );
  const boot = await successful(await user.call("GET", "/bootstrap"));
  assert.equal(boot.history.length, 1);
  assert.equal(boot.resources.dailyTokens, 9);
  assert.equal(boot.stats.total, 5);
  assert.equal(boot.stats.correct, 1);
  assert.equal(boot.stats.streak, 1);
  assert.equal(boot.stats.recentAverage, 2);
  assert.equal(
    (await successful(await other.call("GET", "/bootstrap"))).history.length,
    0,
  );
});

test("concurrent starts debit once, abandoned attempts do not affect stats, daily balance renews", async () => {
  const user = await account();
  const attempts = await Promise.all([
    user.call("POST", "/sessions", { mode: "rapido", count: 5 }),
    user.call("POST", "/sessions", { mode: "rapido", count: 5 }),
  ]);
  assert.deepEqual(attempts.map((r) => r.statusCode).sort(), [201, 409]);
  const session = attempts.find((r) => r.statusCode === 201).json();
  await successful(await user.call("POST", `/sessions/${session.id}/abandon`));
  let boot = await successful(await user.call("GET", "/bootstrap"));
  assert.equal(boot.resources.dailyTokens, 9);
  assert.equal(boot.stats.total, 0);
  await db.query(
    "UPDATE daily_usage SET spent=10 WHERE user_id=$1 AND day=$2::date",
    [user.id, localDay()],
  );
  assert.equal(
    (await user.call("POST", "/sessions", { mode: "rapido", count: 5 }))
      .statusCode,
    402,
  );
  await db.query("UPDATE daily_usage SET day=$2::date WHERE user_id=$1", [
    user.id,
    shiftDay(localDay(), -1),
  ]);
  boot = await successful(await user.call("GET", "/bootstrap"));
  assert.equal(boot.resources.dailyTokens, 10);
});

test("bookmarks and flashcards persist; grading cards leaves quiz average unchanged", async () => {
  const user = await account();
  await successful(await user.call("PUT", "/bookmarks/1", { marked: true }));
  await successful(await user.call("PUT", "/bookmarks/1", { marked: true }));
  const boot = await successful(await user.call("GET", "/bootstrap"));
  assert.deepEqual(boot.marked, [1]);
  assert.equal(boot.markedQuestions[0].answer, undefined);
  const session = await start(user, { mode: "flashcards" });
  assert.equal(session.total, 1);
  assert.equal(
    (
      await user.call("POST", `/sessions/${session.id}/review`, {
        questionId: 1,
        rating: "Fácil",
      })
    ).statusCode,
    400,
  );
  const revealed = await successful(
    await user.call("POST", `/sessions/${session.id}/questions/1/reveal`),
  );
  assert.equal(revealed.questions[0].answer, knownAnswer({ id: 1 }));
  await successful(
    await user.call("POST", `/sessions/${session.id}/review`, {
      questionId: 1,
      rating: "Fácil",
    }),
  );
  await successful(
    await user.call("POST", `/sessions/${session.id}/review`, {
      questionId: 1,
      rating: "Fácil",
    }),
  );
  assert.equal(
    (
      await user.call("POST", `/sessions/${session.id}/review`, {
        questionId: 1,
        rating: "Difícil",
      })
    ).statusCode,
    409,
  );
  const completed = await successful(
    await user.call("POST", `/sessions/${session.id}/finish`),
  );
  assert.deepEqual(completed.ratings, ["Fácil"]);
  assert.equal(
    (await successful(await user.call("GET", "/bootstrap"))).stats.average,
    null,
  );
  await successful(await user.call("PUT", "/bookmarks/1", { marked: false }));
  assert.equal(
    (await successful(await user.call("GET", "/bootstrap"))).marked.length,
    0,
  );
});

test("review modes select latest unresolved errors and respect selected areas and counts", async () => {
  const user = await account();
  assert.equal(
    (await user.call("POST", "/sessions", { mode: "repaso" })).statusCode,
    422,
  );
  const initial = await start(user);
  await answerAll(user, initial, true);
  await successful(await user.call("POST", `/sessions/${initial.id}/finish`));
  const smart = await start(user, {
    mode: "inteligente",
    count: 2,
    areas: ["Medicina Interna"],
  });
  assert.equal(smart.total, 2);
  assert.ok(smart.questions.every((q) => q.area === "Medicina Interna"));
  await successful(await user.call("POST", `/sessions/${smart.id}/abandon`));
  const redo = await start(user, { mode: "repaso" });
  assert.equal(redo.total, 5);
  await answerAll(user, redo);
  await successful(await user.call("POST", `/sessions/${redo.id}/finish`));
  assert.equal(
    (await user.call("POST", "/sessions", { mode: "repaso" })).statusCode,
    422,
  );
  const filtered = await start(user, {
    mode: "personalizado",
    areas: ["Medicina Interna"],
    topics: ["Cardiología"],
    count: 20,
  });
  assert.equal(filtered.total, 1);
  assert.equal(filtered.questions[0].topic, "Cardiología");
});

test("mission order, free cost and completion rewards are transactional and idempotent", async () => {
  const user = await account();
  assert.equal(
    (await user.call("POST", "/sessions", { mode: "rapido", mission: 1 }))
      .statusCode,
    403,
  );
  const session = await start(user, { mission: 0, count: 1 });
  assert.equal(session.total, 5); // Missions use the server's count, not a client shortcut.
  assert.equal(session.tokenCost, 0);
  assert.equal(
    (await user.call("POST", `/sessions/${session.id}/finish`)).statusCode,
    422,
  );
  await answerAll(user, session);
  const finished = await Promise.all([
    user.call("POST", `/sessions/${session.id}/finish`),
    user.call("POST", `/sessions/${session.id}/finish`),
  ]);
  assert.ok(finished.every((r) => r.statusCode === 200));
  let boot = await successful(await user.call("GET", "/bootstrap"));
  assert.deepEqual(boot.completed, [0]);
  assert.equal(boot.resources.bonusTokens, 1);
  assert.equal(boot.resources.dailyTokens, 10);
  const repeat = await start(user, { mission: 0 });
  await answerAll(user, repeat);
  await successful(await user.call("POST", `/sessions/${repeat.id}/finish`));
  boot = await successful(await user.call("GET", "/bootstrap"));
  assert.equal(boot.resources.bonusTokens, 1);
  const next = await start(user, { mission: 1 });
  assert.ok(
    next.questions.every((q) => q.area === "Ginecología y Obstetricia"),
  );
});

test("recovery uses expiring single-use links and revokes existing sessions", async () => {
  const user = await account();
  const known = await successful(
    await user.call("POST", "/auth/forgot-password", { email: user.email }),
  );
  const unknown = await successful(
    await user.call("POST", "/auth/forgot-password", {
      email: "not-registered@example.test",
    }),
  );
  assert.deepEqual(known, unknown);
  const mail = delivered.find((m) => m.email === user.email);
  const token = new URLSearchParams(mail.url.split("?")[1]).get("token");
  const { rows } = await db.query(
    "SELECT token_hash FROM password_resets WHERE user_id=$1",
    [user.id],
  );
  assert.equal(rows[0].token_hash, tokenHash(token));
  assert.notEqual(rows[0].token_hash, token);
  await successful(
    await user.call("POST", "/auth/reset-password", {
      token,
      password: "a-new-password",
    }),
  );
  assert.equal((await user.call("GET", "/auth/me")).statusCode, 401);
  assert.equal(
    (
      await user.call("POST", "/auth/reset-password", {
        token,
        password: "another-password",
      })
    ).statusCode,
    400,
  );
  const login = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    remoteAddress: user.remoteAddress,
    payload: { email: user.email, password: "a-new-password" },
  });
  assert.equal(login.statusCode, 200);
  const expired = await account();
  await successful(
    await expired.call("POST", "/auth/forgot-password", {
      email: expired.email,
    }),
  );
  const expiredToken = delivered
    .find((m) => m.email === expired.email)
    .url.split("?token=")[1];
  await db.query(
    "UPDATE password_resets SET expires_at=now()-interval '1 second' WHERE user_id=$1",
    [expired.id],
  );
  assert.equal(
    (
      await expired.call("POST", "/auth/reset-password", {
        token: expiredToken,
        password: "another-password",
      })
    ).statusCode,
    400,
  );
});

test("logout revokes access and login attempts are rate limited", async () => {
  const user = await account();
  await successful(await user.call("POST", "/auth/logout"));
  assert.equal((await user.call("GET", "/bootstrap")).statusCode, 401);
  let response;
  for (let i = 0; i < 11; i++)
    response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      remoteAddress: "10.1.1.1",
      payload: {
        email: "missing@example.test",
        password: "incorrect-password",
      },
    });
  assert.equal(response.statusCode, 429);
});

test("bank imports validate before writing and snapshots preserve previous results", async () => {
  const user = await account();
  const session = await start(user, {
    mode: "personalizado",
    areas: ["Cirugía"],
    count: 1,
  });
  await answerAll(user, session);
  await successful(await user.call("POST", `/sessions/${session.id}/finish`));
  const original = sampleQuestions.find((q) => q.id === 4);
  await assert.rejects(() =>
    importQuestions(db, [
      { ...original, text: "Edited bank question" },
      { ...original, id: 6, answer: 9 },
    ]),
  );
  assert.equal(
    (await db.query("SELECT text FROM questions WHERE id=4")).rows[0].text,
    original.text,
  );
  await importQuestions(db, [
    {
      ...original,
      text: "Edited bank question",
      answer: (original.answer + 1) % 4,
    },
  ]);
  const result = await successful(
    await user.call("GET", `/sessions/${session.id}`),
  );
  assert.equal(result.questions[0].text, original.text);
  assert.equal(result.score, 100);
  await importQuestions(db, [{ ...original, sample: true }]);
  await migrate(db); // migration re-run leaves data intact
});

test("production requires PostgreSQL and HTTPS; built web serves with API under same origin", async () => {
  assert.throws(
    () =>
      loadConfig({
        production: true,
        databaseUrl: "",
        databaseHost: "",
        origin: "https://example.test",
      }),
    /DATABASE_URL/,
  );
  assert.throws(
    () =>
      loadConfig({
        production: true,
        databaseUrl: "postgres://example",
        origin: "http://example.test",
      }),
    /HTTPS/,
  );
  const staticDb = await createDatabase(config, { memory: true });
  const web = await createApp({
    config,
    db: staticDb,
    logger: false,
    serveStatic: true,
  });
  try {
    const html = await web.inject("/");
    assert.equal(html.statusCode, 200);
    assert.match(html.headers["content-type"], /text\/html/);
    assert.match(html.body, /<div id="root">/);
    assert.equal((await web.inject("/api/missing")).statusCode, 404);
    assert.equal((await web.inject("/api/health")).statusCode, 200);
    assert.equal(
      (await web.inject("/api/health")).headers["cache-control"],
      "no-store",
    );
  } finally {
    await web.close();
  }
});

test("local database prevents concurrent opens and survives a server restart", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "entrenarme-persistence-"));
  const localConfig = loadConfig({
    production: false,
    databaseUrl: "",
    databaseHost: "",
    dataDir,
    sampleBank: true,
  });
  let first, second;
  try {
    first = await createApp({ config: localConfig, logger: false });
    await assert.rejects(() => createDatabase(localConfig), /proceso asignado/);
    const registration = await first.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        name: "Persistente",
        email: "persistence@example.test",
        password: "testing-password",
      },
    });
    assert.equal(registration.statusCode, 201);
    const cookie = registration.cookies[0];
    const headers = {
      cookie: `${cookie.name}=${cookie.value}`,
      "x-csrf-token": registration.json().csrfToken,
    };
    const started = await first.inject({
      method: "POST",
      url: "/api/sessions",
      headers,
      payload: { mode: "rapido", count: 5 },
    });
    assert.equal(started.statusCode, 201);
    const session = started.json();
    const patch = await first.inject({
      method: "PATCH",
      url: `/api/sessions/${session.id}`,
      headers,
      payload: { current: 2, answers: { [session.questions[0].id]: 1 } },
    });
    assert.equal(patch.statusCode, 200);
    await first.close();
    first = null;
    second = await createApp({ config: localConfig, logger: false });
    const bootstrap = await second.inject({ url: "/api/bootstrap", headers });
    assert.equal(bootstrap.statusCode, 200);
    const saved = bootstrap.json();
    assert.equal(saved.profile.name, "Persistente");
    assert.equal(saved.activeSession.id, session.id);
    assert.equal(saved.activeSession.current, 2);
    assert.equal(saved.activeSession.answers[session.questions[0].id], 1);
    assert.equal(saved.resources.dailyTokens, 9);
  } finally {
    if (first) await first.close();
    if (second) await second.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("Azure configuration supports separate fields and prevents TLS URL overrides", () => {
  const azure = loadConfig({
    production: true,
    databaseUrl: "",
    databaseHost: "example.postgres.database.azure.com",
    databasePort: 5432,
    databaseUser: "test-admin",
    databasePassword: "test-only#@:/value",
    databaseName: "entrenarme",
    databaseSsl: true,
    origin: "https://example.test",
  });
  assert.equal(azure.databasePassword, "test-only#@:/value");
  assert.equal(azure.databaseHost, "example.postgres.database.azure.com");
  assert.throws(
    () => loadConfig({ databaseHost: "example.test", databasePort: NaN }),
    /PGPORT/,
  );
  assert.throws(
    () =>
      loadConfig({
        databaseUrl: "postgresql://example.test/db?sslmode=require",
        databaseSsl: true,
      }),
    /sin parámetros SSL/,
  );
});

test("production API accepts a same-origin frontend proxy and preserves secure sessions", async () => {
  const apiConfig = loadConfig({
    production: true,
    databaseUrl: "",
    databaseHost: "example.postgres.database.azure.com",
    databaseSsl: true,
    origin: "https://frontenarm.onrender.com",
    serveFrontend: false,
    sampleBank: false,
    trustProxy: true,
  });
  const memoryDb = await createDatabase(apiConfig, { memory: true });
  const api = await createApp({
    config: apiConfig,
    db: memoryDb,
    logger: false,
  });
  try {
    assert.equal((await api.inject("/")).statusCode, 404);
    const headers = {
      origin: apiConfig.origin,
      "sec-fetch-site": "same-origin",
    };
    const registration = await api.inject({
      method: "POST",
      url: "/api/auth/register",
      headers,
      payload: {
        name: "Demo Azure",
        email: "azure-proxy@example.test",
        password: "testing-password",
      },
    });
    assert.equal(registration.statusCode, 201, registration.body);
    const cookie = registration.cookies[0];
    assert.equal(cookie.name, "__Host-entrenarme");
    assert.equal(cookie.secure, true);
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.sameSite, "Lax");
    assert.equal(cookie.domain, undefined);
    headers.cookie = `${cookie.name}=${cookie.value}`;
    headers["x-csrf-token"] = registration.json().csrfToken;
    assert.equal(
      (await api.inject({ url: "/api/auth/me", headers })).statusCode,
      200,
    );
    assert.equal(
      (
        await api.inject({
          method: "PATCH",
          url: "/api/profile",
          headers,
          payload: { name: "Demo guardada" },
        })
      ).statusCode,
      200,
    );
    const invalid = await api.inject({
      method: "PATCH",
      url: "/api/profile",
      headers: { ...headers, origin: "https://attacker.test" },
      payload: { name: "No" },
    });
    assert.equal(invalid.statusCode, 403);
    const crossSite = await api.inject({
      method: "PATCH",
      url: "/api/profile",
      headers: { ...headers, "sec-fetch-site": "cross-site" },
      payload: { name: "No" },
    });
    assert.equal(crossSite.statusCode, 403);
    assert.equal(
      (await api.inject("/api/health")).headers["cache-control"],
      "no-store",
    );
  } finally {
    await api.close();
  }
});
