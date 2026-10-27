import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createEnarmApi,
  normalizeSession,
  normalizeStats,
} from "../src/enarm-api.js";
import { createWebHost } from "../server/web.js";
const baseUrl = "https://oksifebzxhciydqryisi.supabase.co";
const question = (id, position, extra = {}) => ({
  sessionQuestionId: id,
  position,
  globalKey: `bank-${id}`,
  questionText: "Reactivo de contrato",
  options: ["A", "B", "C", "D"],
  case: { caseText: "Caso compartido", caseOrder: position },
  state: "unanswered",
  selectedAnswer: null,
  rating: null,
  feedback: null,
  ...extra,
});
const state = (extra = {}) => {
  const questions = [question("item-a", 1), question("item-b", 2)];
  return {
    sessionId: "session-a",
    status: "active",
    activityType: "quick_quiz",
    activitySource: "quizzes",
    feedbackPolicy: "deferred",
    countsForAverage: true,
    currentPosition: 1,
    currentQuestion: questions[0],
    questions,
    progress: { questionCount: 2, completedItemCount: 0 },
    canFinish: false,
    nextAction: "answer_question",
    result: null,
    ...extra,
  };
};
function setup(handler, { auth = {}, location } = {}) {
  const calls = [];
  const client = {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            access_token: "test-access",
            user: { email: "qa@example.test" },
          },
        },
        error: null,
      }),
      refreshSession: async () => ({
        data: { session: { access_token: "refreshed" } },
        error: null,
      }),
      ...auth,
    },
  };
  const api = createEnarmApi({
    client,
    baseUrl,
    publicKey: "sb_publishable_test",
    location,
    fetcher: async (url, options) => {
      const request = {
        name: url.split("/").at(-1),
        ...options,
        body: options.body ? JSON.parse(options.body) : undefined,
      };
      calls.push(request);
      return handler(request, calls.length);
    },
  });
  return { api, calls, client };
}
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
test("opaque session IDs and bank bookmark IDs remain distinct; options and index zero survive", () => {
  const q = question("opaque-item", 1, { selectedAnswer: 0 });
  const raw = state({
    currentQuestion: q,
    questions: [q],
    progress: { questionCount: 1, completedItemCount: 1 },
  });
  const result = normalizeSession(raw);
  assert.equal(result.questions[0].id, "opaque-item");
  assert.equal(result.questions[0].globalKey, "bank-opaque-item");
  assert.equal(result.current, 0);
  assert.equal(result.answers["opaque-item"], 0);
  assert.deepEqual(result.questions[0].options, ["A", "B", "C", "D"]);
  assert.equal(result.questions[0].caseText, "Caso compartido");
});
test("deferred quiz feedback is hidden until completed; flashcard requires local reveal of current card", () => {
  const q = question("item-a", 1, {
    feedback: { correctAnswer: 0, explanation: "Respuesta" },
  });
  assert.equal(
    normalizeSession(state({ questions: [q], currentQuestion: q })).questions[0]
      .answer,
    undefined,
  );
  assert.equal(
    normalizeSession(
      state({
        status: "completed",
        questions: [q],
        currentQuestion: null,
        currentPosition: null,
      }),
    ).questions[0].answer,
    0,
  );
  const flash = state({
    activityType: "flashcards",
    feedbackPolicy: "immediate",
    questions: [q, question("future", 2, { feedback: q.feedback })],
    currentQuestion: q,
  });
  const hidden = normalizeSession(flash);
  assert.equal(hidden.questions[0].answer, undefined);
  const shown = normalizeSession(
    flash,
    new Set(["session-a/item-a", "session-a/future"]),
  );
  assert.equal(shown.questions[0].answer, 0);
  assert.equal(shown.questions[1].answer, undefined);
});
test("smart review is a question and rating flow, independent from flashcards and averages", () => {
  const q = question("item-a", 1, {
    state: "answered_pending_rating",
    selectedAnswer: 1,
    feedback: { correctAnswer: 0, isCorrect: false },
  });
  const s = normalizeSession(
    state({
      activityType: "smart_review",
      feedbackPolicy: "immediate",
      countsForAverage: false,
      currentQuestion: q,
      questions: [q],
      nextAction: "rate_question",
    }),
  );
  assert.equal(s.isCards, false);
  assert.equal(s.countsForAverage, false);
  assert.equal(s.questions[0].answer, 0);
  assert.equal(s.nextAction, "rate_question");
});
test("personalized start sends exact contract filters without user identity or membership", async () => {
  const { api, calls } = setup((r) =>
    json(r.name === "quiz-start" ? { sessionId: "session-a" } : state()),
  );
  await api.start({
    mode: "personalizado",
    count: 30,
    areas: ["Pediatría"],
    topics: ["Tema"],
    tags: ["Etiqueta"],
    specialties: ["Especialidad"],
    userId: "must-not-send",
    plan: "premium",
  });
  assert.deepEqual(calls[0].body, {
    activityType: "custom_quiz",
    activitySource: "quizzes",
    questionCount: 30,
    selectedAreas: ["Pediatría"],
    selectedTopics: ["Tema"],
    selectedSpecialties: ["Especialidad"],
    selectedTags: ["Etiqueta"],
  });
  assert.equal(calls[0].headers.Authorization, "Bearer test-access");
  assert.equal(calls[0].credentials, "omit");
  assert.equal(calls[1].name, "quiz-state");
});
test("answer, rating, pause and completion reload state; marks use globalKey", async () => {
  const { api, calls } = setup((r) =>
    json(r.name === "quiz-state" ? state() : { status: "ok" }),
  );
  await api.patchSession("session-a", { answers: { "item-a": 0 } });
  await api.rate("session-a", "item-a", "Regular");
  await api.pause("session-a");
  await api.resume("session-a");
  await api.finish("session-a");
  await api.mark("bank-item-a", true);
  await api.mark("bank-item-a", false);
  assert.deepEqual(calls[0].body, {
    sessionQuestionId: "item-a",
    selectedAnswer: 0,
  });
  assert.deepEqual(calls[2].body, {
    sessionQuestionId: "item-a",
    rating: "medio",
  });
  assert.deepEqual(
    calls.filter((x) => x.name === "quiz-finish").map((x) => x.body.action),
    ["pause", "resume", "finish"],
  );
  assert.deepEqual(calls.at(-1).body, { globalKey: "bank-item-a" });
  assert.equal(calls.at(-1).method, "DELETE");
});
test("a network failure never resends a mutation automatically", async () => {
  const { api, calls } = setup(() => {
    throw new TypeError("connection lost");
  });
  await assert.rejects(
    api.start({ mode: "rapido", count: 20 }),
    (e) => e.code === "NETWORK_ERROR",
  );
  assert.equal(calls.length, 1);
});
test("401 read refreshes once; 403 provision error stays distinct from expiration and Premium", async () => {
  let refreshes = 0;
  const first = setup(
    (r, n) =>
      n === 1 ? json({ error: "unauthorized" }, 401) : json({ profile: {} }),
    {
      auth: {
        refreshSession: async () => {
          refreshes++;
          return { data: { session: { access_token: "new" } }, error: null };
        },
      },
    },
  );
  await first.api.call("profile-get", { method: "GET" });
  assert.equal(refreshes, 1);
  assert.equal(first.calls.length, 2);
  for (const code of [
    "user_not_provisioned",
    "user_inactive",
    "premium_required",
  ]) {
    const { api } = setup(() => json({ error: code }, 403));
    await assert.rejects(
      api.call("profile-get", { method: "GET" }),
      (e) => e.code === code && e.status === 403,
    );
  }
});
test("registration requiring email confirmation does not fabricate an application session", async () => {
  let signupPayload;
  const { api, calls } = setup(
    () => {
      throw Error("must not call functions");
    },
    {
      location: {
        origin: "https://demo.example",
        href: "https://demo.example/",
        hash: "",
      },
      auth: {
        signUp: async (payload) => {
          signupPayload = payload;
          return { data: { session: null }, error: null };
        },
      },
    },
  );
  assert.deepEqual(
    await api.authenticate(true, {
      email: "qa@example.test",
      password: "a-test-password",
      name: "Prueba",
      plan: "premium",
    }),
    { confirmationRequired: true },
  );
  assert.equal(calls.length, 0);
  assert.deepEqual(Object.keys(signupPayload).sort(), [
    "email",
    "options",
    "password",
  ]);
});
test("recovery callback is exchanged before showing reset, including without a provisioned profile", async () => {
  const location = {
    href: "https://demo.example/?code=one-use&auth=recovery",
    origin: "https://demo.example",
    hash: "",
  };
  let exchange = 0;
  const { api, calls } = setup(
    () => {
      throw Error("must not require profile");
    },
    {
      location,
      auth: {
        exchangeCodeForSession: async (code) => {
          assert.equal(code, "one-use");
          exchange++;
          return { error: null };
        },
      },
    },
  );
  assert.deepEqual(await api.restore(), { authRecovery: true });
  assert.deepEqual(await api.restore(), { authRecovery: true });
  assert.equal(exchange, 1);
  assert.equal(calls.length, 0);
  assert.equal(location.hash, "#/restablecer");
});
test("stats keep weighted scores in 0–100, accuracy separately, and missing averages null", () => {
  const stats = normalizeStats({
    currentAverage: { score: 86.25 },
    historicalAverage: { score: null },
    areaStats: [
      {
        area: "Pediatría",
        answered: 10,
        correct: 6,
        accuracy: 60,
        average: 75,
      },
    ],
    exposure: { bankTotal: 100, percentage: 10 },
  });
  assert.equal(stats.recentAverage, 86.25);
  assert.equal(stats.average, null);
  assert.equal(stats.areaStats[0].score, 60);
  assert.equal(stats.areaStats[0].average, 75);
  assert.equal(stats.streak, undefined);
});
test("ENARMapa delegates mission selection with empty body and handles rest without a quiz", async () => {
  const { api, calls } = setup(() => json({ status: "rest_ready" }));
  assert.deepEqual(await api.startMission(), { rest: true });
  assert.deepEqual(calls[0].body, {});
  assert.equal(calls.length, 1);
});
test("Azure web host serves frontend with restrictive Supabase CSP and no legacy login or database", async () => {
  const app = await createWebHost({ logger: false });
  try {
    const r = await app.inject("/");
    assert.equal(r.statusCode, 200);
    assert.match(
      r.headers["content-security-policy"],
      /connect-src 'self' https:\/\/oksifebzxhciydqryisi\.supabase\.co/,
    );
    assert.match(r.headers["cache-control"], /no-store/);
    const health = await app.inject("/api/health");
    assert.equal(health.json().backend, "supabase");
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/api/auth/login",
          payload: {},
        })
      ).statusCode,
      404,
    );
  } finally {
    await app.close();
  }
});

test("bootstrap recovers a paused ENARMapa mission even when history-list omits it", async () => {
  const { api } = setup((r) =>
    json(
      r.name === "profile-get"
        ? { profile: { displayName: "Prueba", plan: "free" } }
        : r.name === "stats-summary"
          ? {}
          : r.name === "enarmapa-state"
            ? {
                nodes: [],
                currentMission: {
                  status: "in_progress",
                  sessionId: "session-a",
                },
              }
            : r.name === "marked-questions"
              ? { markedQuestions: [] }
              : r.name === "history-list"
                ? { items: [], pagination: { hasMore: false } }
                : state({ status: "paused" }),
    ),
  );
  const boot = await api.bootstrap();
  assert.equal(boot.activeSession.id, "session-a");
  assert.equal(boot.activeSession.status, "paused");
});
