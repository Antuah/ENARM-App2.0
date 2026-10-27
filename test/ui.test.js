import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { normalizeSession, normalizeStats } from "../src/enarm-api.js";
let vite, ui;
before(async () => {
  vite = await createServer({
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false },
    plugins: [
      {
        name: "contract-render",
        enforce: "pre",
        resolveId(id, importer) {
          if (id === "./api.js" && importer?.endsWith("/src/App.jsx"))
            return "\0test-api";
        },
        load(id) {
          if (id === "\0test-api") return "export const api = {}";
        },
        transform(code, id) {
          if (id.endsWith("/src/App.jsx"))
            return (
              code +
              "\nexport { Dashboard, QuizSetup, QuizRunner, Results, Roadmap, Stats, HistoryPage, Profile, SettingsPage, Marked, Auth };"
            );
        },
      },
    ],
  });
  ui = await vite.ssrLoadModule("/src/App.jsx");
});
after(async () => {
  await vite?.close();
});
const noop = () => {};
const profile = {
  name: "Persona",
  lastname: "",
  email: "qa@example.test",
  specialty: "",
  plan: "Básico",
  planId: "free",
};
const stats = normalizeStats({
  currentAverage: { score: null },
  historicalAverage: { score: null },
  responses: 0,
  uniqueQuestions: 0,
  areaStats: [],
  weekly: [],
  exposure: { bankTotal: 100 },
  correct: { count: 0 },
  incorrect: { count: 0 },
});
const roadmap = {
  currentWeek: 1,
  today: "2026-10-27",
  canAdvanceToday: true,
  currentMission: {
    missionLabel: "Descanso",
    plannedRestDay: true,
    status: "available",
  },
  nodes: [],
};
const render = (name, props) =>
  renderToStaticMarkup(createElement(ui[name], props));
test("empty external profile and statistics render without invented balances, streaks or years", () => {
  const html = render("Dashboard", {
    profile,
    completed: [],
    stats,
    roadmap,
    activeSession: null,
    go: noop,
    openModal: noop,
  });
  assert.match(html, /Descanso/);
  assert.match(html, /100/);
  assert.doesNotMatch(html, /tokens|días de racha|2027/);
  for (const [name, props] of [
    ["Stats", { initialStats: stats, premium: false }],
    ["Profile", { profile, marked: [], go: noop, openModal: noop }],
    ["SettingsPage", { profile, go: noop, updateProfile: noop }],
    ["Roadmap", { roadmap, openModal: noop, completeRest: noop }],
  ])
    assert.ok(render(name, props).length > 100);
});
test("current session item is rendered, respecting server action and no answer editing or arbitrary navigation", () => {
  const q = {
    sessionQuestionId: "item",
    globalKey: "bank-key",
    position: 1,
    questionText: "Caso de contrato",
    options: ["Opción A", "Opción B", "Opción C", "Opción D"],
    state: "unanswered",
    selectedAnswer: null,
    feedback: null,
  };
  const session = normalizeSession({
    sessionId: "session",
    status: "active",
    activityType: "quick_quiz",
    activitySource: "quizzes",
    feedbackPolicy: "deferred",
    questions: [q],
    currentQuestion: q,
    currentPosition: 1,
    nextAction: "answer_question",
    progress: { questionCount: 1, completedItemCount: 0 },
    canFinish: false,
  });
  const html = render("QuizRunner", {
    session,
    marked: [],
    busy: false,
    patchSession: noop,
    reveal: noop,
    rate: noop,
    finish: noop,
    refresh: noop,
    resume: noop,
    openModal: noop,
    toggleMark: noop,
  });
  assert.match(html, /Confirmar respuesta/);
  assert.doesNotMatch(html, /Anterior|Revelar respuesta/);
  assert.match(html, /Caso de contrato/);
  const paused = render("QuizRunner", {
    session: { ...session, status: "paused" },
    resume: noop,
  });
  assert.match(paused, /Reanudar entrenamiento/);
  const done = render("QuizRunner", {
    session: {
      ...session,
      current: null,
      canFinish: true,
      nextAction: "finish_session",
    },
    marked: [],
    openModal: noop,
  });
  assert.match(done, /Finalizar y ver resultado/);
});
test("bookmark references and paginated history render without requiring full question records", () => {
  assert.match(
    render("Marked", {
      list: [{ globalKey: "opaque", markedAt: "2026-10-27T12:00:00Z" }],
      toggleMark: noop,
      go: noop,
    }),
    /Pregunta marcada 1/,
  );
  assert.match(
    render("HistoryPage", {
      history: [],
      pagination: { hasMore: true, offset: 0, limit: 20 },
      open: noop,
      go: noop,
    }),
    /Cargar más actividades/,
  );
});
test("custom setup and Auth forms expose only supported goals and canonical count ranges", () => {
  const quiz = render("QuizSetup", {
    mode: "flashcards",
    marked: [],
    start: noop,
    go: noop,
  });
  assert.doesNotMatch(quiz, />100<|tokens/);
  const auth = render("Auth", {
    route: "/registro",
    go: noop,
    authenticate: noop,
  });
  assert.match(auth, /Especialidad objetivo/);
  assert.doesNotMatch(auth, /Año del ENARM|ELIGE TU PLAN/);
});
