import { activities, areas } from "./catalog.js";

export class ApiError extends Error {
  constructor(message, status = 0, code = "REQUEST_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}
const modes = {
  rapido: "quick_quiz",
  repaso: "review_quiz",
  personalizado: "custom_quiz",
  inteligente: "smart_review",
  flashcards: "flashcards",
};
const ratings = { facil: "Fácil", medio: "Regular", dificil: "Difícil" };
const messages = {
  unauthorized: "Inicia sesión para continuar.",
  user_not_provisioned:
    "Tu cuenta se creó, pero el responsable del servicio todavía debe habilitar tu perfil. Solicita la activación e intenta de nuevo.",
  user_inactive:
    "Tu cuenta está inactiva. Contacta al responsable del servicio.",
  premium_required: "Esta actividad requiere una membresía Premium activa.",
  insufficient_questions:
    "No hay suficientes preguntas elegibles. Prueba con una cantidad menor o cambia los filtros.",
  no_published_release: "El banco de preguntas todavía no está publicado.",
  question_already_answered:
    "La respuesta ya se guardó. Actualiza el entrenamiento para recuperar el avance.",
  question_already_rated:
    "La valoración ya se guardó. Actualiza el entrenamiento.",
  invalid_session_sequence:
    "Continúa desde la pregunta indicada por el entrenamiento.",
  pending_question_rating:
    "Valora la dificultad de la pregunta antes de continuar.",
  previous_question_rating_required: "Primero valora la pregunta anterior.",
  enarmapa_requires_full_completion:
    "Completa todos los reactivos para terminar esta misión. También puedes pausarla.",
  daily_mission_already_completed:
    "Ya completaste tu misión de hoy. Consulta tu ruta para conocer el próximo desbloqueo.",
  session_not_active:
    "La actividad no está activa. Actualiza su estado o reanúdala.",
  session_not_finishable: "Esta actividad todavía no se puede finalizar.",
  invalid_credentials: "El correo o la contraseña no coinciden.",
  email_not_confirmed: "Confirma tu correo antes de iniciar sesión.",
  over_email_send_rate_limit:
    "Espera unos minutos antes de solicitar otro correo.",
};
const dateLabel = (value) =>
  value
    ? new Date(value).toLocaleDateString("es-MX", {
        timeZone: "America/Mexico_City",
      })
    : "";
const nullableNumber = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;
export function normalizeSession(raw, revealed = new Set()) {
  if (!raw?.sessionId || !Array.isArray(raw.questions))
    throw new ApiError(
      "El servicio devolvió una actividad incompleta.",
      502,
      "INVALID_RESPONSE",
    );
  const mode =
    Object.keys(modes).find((key) => modes[key] === raw.activityType) ||
    "rapido";
  const isCards = mode === "flashcards";
  const questions = [...raw.questions]
    .sort((a, b) => a.position - b.position)
    .map((q) => {
      const mayShow =
        raw.status === "completed" ||
        (raw.feedbackPolicy === "immediate" &&
          (isCards
            ? q.state === "completed" ||
              (raw.currentQuestion?.sessionQuestionId === q.sessionQuestionId &&
                revealed.has(`${raw.sessionId}/${q.sessionQuestionId}`))
            : Number.isInteger(q.selectedAnswer)));
      const feedback = mayShow ? q.feedback : null;
      return {
        id: q.sessionQuestionId,
        globalKey: q.globalKey,
        position: q.position,
        text: q.questionText,
        options: q.options,
        caseText: q.case?.caseText || null,
        state: q.state,
        area: "",
        topic: "Reactivo",
        answer: Number.isInteger(feedback?.correctAnswer)
          ? feedback.correctAnswer
          : undefined,
        explanation: feedback?.explanation || "",
        isCorrect: feedback?.isCorrect ?? null,
      };
    });
  const answers = {},
    ratingMap = {};
  for (const q of raw.questions) {
    if (Number.isInteger(q.selectedAnswer))
      answers[q.sessionQuestionId] = q.selectedAnswer;
    if (q.rating) ratingMap[q.sessionQuestionId] = ratings[q.rating];
  }
  const currentId = raw.currentQuestion?.sessionQuestionId;
  const index = currentId
    ? questions.findIndex((q) => q.id === currentId)
    : questions.findIndex((q) => q.position === raw.currentPosition);
  const result = raw.result;
  return {
    id: raw.sessionId,
    status: raw.status,
    mode,
    title: activities.find((a) => a.id === mode)?.title || "Entrenamiento",
    isCards,
    countsForAverage: raw.countsForAverage,
    feedbackPolicy: raw.feedbackPolicy,
    mission: raw.activitySource === "enarmapa" ? true : null,
    questions,
    current: index >= 0 ? index : null,
    answers,
    ratingMap,
    ratings: Object.values(ratingMap),
    ratedIds: Object.keys(ratingMap),
    total: raw.progress?.questionCount ?? questions.length,
    completedItemCount: raw.progress?.completedItemCount ?? 0,
    canFinish: raw.canFinish === true,
    finishBlockedReason: raw.finishBlockedReason,
    nextAction: raw.nextAction,
    correct: nullableNumber(result?.correctCount),
    score: nullableNumber(result?.weightedScore),
    rawAccuracy: nullableNumber(result?.rawAccuracy),
    result,
    releaseVersion: raw.releaseVersion,
    date: dateLabel(raw.completedAt || raw.startedAt),
  };
}
export function normalizeStats(raw) {
  return {
    recentAverage: nullableNumber(raw.currentAverage?.score),
    average: nullableNumber(raw.historicalAverage?.score),
    total: raw.responses ?? 0,
    unique: raw.uniqueQuestions ?? 0,
    bankTotal: raw.exposure?.bankTotal ?? null,
    exposure: raw.exposure?.percentage ?? null,
    correct: raw.correct?.count ?? 0,
    incorrect: raw.incorrect?.count ?? 0,
    scoringModel: raw.scoringModelVersion,
    weights: raw.scoringWeights,
    timezone: raw.timezone,
    weekly: raw.weekly || [],
    areaStats: (raw.areaStats || []).map((a) => ({
      ...areas.find((x) => x.name === a.area),
      name: a.area,
      total: a.answered,
      correct: a.correct,
      score: a.accuracy,
      average: a.average,
    })),
    bestArea: raw.bestArea ? { name: raw.bestArea.area } : null,
  };
}
export function normalizeHistory(raw) {
  return {
    items: (raw.items || []).map((h) => ({
      ...h,
      id: h.sessionId,
      mode: Object.keys(modes).find((k) => modes[k] === h.activityType),
      title:
        activities.find((a) => modes[a.id] === h.activityType)?.title ||
        "Entrenamiento",
      isCards: h.activityType === "flashcards",
      score: h.weightedScore ?? null,
      correct: h.correctCount ?? null,
      total: h.questionCount,
      date: dateLabel(h.completedAt || h.startedAt),
    })),
    pagination: raw.pagination,
  };
}
export function createEnarmApi({
  client,
  baseUrl,
  publicKey,
  fetcher = globalThis.fetch,
  location,
  replaceUrl = () => {},
  remember = () => {},
  pendingProfile,
}) {
  if (
    !baseUrl?.startsWith("https://") ||
    !publicKey?.startsWith("sb_publishable_")
  )
    throw new Error(
      "Configura la URL HTTPS y la llave publicable de Supabase.",
    );
  const revealed = new Set();
  let callback;
  const failAuth = (error) => {
    if (error)
      throw new ApiError(
        messages[error.code] ||
          error.message ||
          "No pudimos validar tu sesión.",
        error.status || 400,
        error.code,
      );
  };
  async function prepareAuth() {
    if (!callback)
      callback = (async () => {
        if (!location) return;
        const url = new URL(location.href);
        if (url.searchParams.has("code")) {
          const { error } = await client.auth.exchangeCodeForSession(
            url.searchParams.get("code"),
          );
          url.searchParams.delete("code");
          const recovery = url.searchParams.get("auth") === "recovery";
          url.searchParams.delete("auth");
          url.hash = recovery ? "/restablecer" : "/login";
          replaceUrl(url.toString());
          if (location.hash !== url.hash) location.hash = url.hash;
          failAuth(error);
        }
      })().catch((error) => {
        callback = undefined;
        throw error;
      });
    return callback;
  }
  async function call(
    name,
    {
      method = "POST",
      body,
      retry = [
        "profile-get",
        "quiz-state",
        "quiz-filter-options",
        "history-list",
        "marked-questions",
        "enarmapa-state",
        "stats-summary",
        "stats-analysis",
      ].includes(name) &&
        (method === "GET" ||
          ["quiz-state", "quiz-filter-options", "history-list"].includes(name)),
    } = {},
  ) {
    await prepareAuth();
    const { data, error } = await client.auth.getSession();
    failAuth(error);
    if (!data.session?.access_token)
      throw new ApiError(
        "Inicia sesión para continuar.",
        401,
        "UNAUTHENTICATED",
      );
    let response;
    try {
      response = await fetcher(`${baseUrl}/functions/v1/${name}`, {
        method,
        cache: "no-store",
        credentials: "omit",
        headers: {
          apikey: publicKey,
          Authorization: `Bearer ${data.session.access_token}`,
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(20000),
      });
    } catch {
      throw new ApiError(
        "No recibimos confirmación del servidor. Actualiza el estado antes de repetir la operación.",
        0,
        "NETWORK_ERROR",
      );
    }
    let payload = null;
    const text = await response.text();
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {}
    if (response.status === 401 && retry) {
      const refreshed = await client.auth.refreshSession();
      if (!refreshed.error && refreshed.data.session)
        return call(name, { method, body, retry: false });
      throw new ApiError(
        "Tu sesión terminó. Inicia sesión de nuevo.",
        401,
        "UNAUTHENTICATED",
      );
    }
    if (!response.ok) {
      const code =
        payload?.error_code ||
        payload?.code ||
        (typeof payload?.error === "string"
          ? payload.error
          : payload?.error?.code) ||
        payload?.quizStart?.error ||
        "REQUEST_ERROR";
      throw new ApiError(
        messages[code] ||
          (response.status === 429
            ? "Demasiados intentos. Espera antes de continuar."
            : response.status >= 500
              ? "El servicio no pudo completar la operación. Inténtalo más tarde."
              : payload?.message || "No se pudo completar la operación."),
        response.status,
        response.status === 401 ? "UNAUTHENTICATED" : code,
      );
    }
    if (response.status === 204) return null;
    if (!payload || typeof payload !== "object")
      throw new ApiError(
        "El servicio devolvió una respuesta no válida.",
        502,
        "INVALID_RESPONSE",
      );
    return payload;
  }
  async function session(id) {
    return normalizeSession(
      await call("quiz-state", { body: { sessionId: id } }),
      revealed,
    );
  }
  async function profile() {
    const raw = (await call("profile-get", { method: "GET" })).profile;
    if (!raw)
      throw new ApiError(
        "El servicio no devolvió tu perfil.",
        502,
        "INVALID_RESPONSE",
      );
    return {
      name: raw.displayName || raw.email?.split("@")[0] || "Mi cuenta",
      lastname: "",
      email: raw.email || "",
      specialty: raw.targetSpecialty || "",
      target: null,
      plan: raw.plan === "premium" ? "Premium" : "Básico",
      planId: raw.plan,
    };
  }
  async function history({ offset = 0, status = "all", limit = 20 } = {}) {
    return normalizeHistory(
      await call("history-list", { body: { offset, limit, status } }),
    );
  }
  async function bootstrap() {
    const [user, stats, roadmap, marks, past, pending] = await Promise.all([
      profile(),
      call("stats-summary", { method: "GET" }),
      call("enarmapa-state", { method: "GET" }),
      call("marked-questions", { method: "GET" }),
      history(),
      history({ status: "in_progress", limit: 1 }),
    ]);
    // ENARMapa's pending session is not necessarily included in history-list.
    const activeId =
      pending.items[0]?.id ||
      (roadmap.currentMission?.status === "in_progress"
        ? roadmap.currentMission.sessionId
        : null);
    return {
      profile: user,
      stats: normalizeStats(stats),
      roadmap,
      completed: (roadmap.nodes || [])
        .filter((n) => n.status === "completed")
        .map((n) => n.mapDay),
      marked: (marks.markedQuestions || []).map((m) => m.globalKey),
      markedQuestions: marks.markedQuestions || [],
      history: past.items,
      historyPagination: past.pagination,
      activeSession: activeId ? await session(activeId) : null,
      catalog: { total: stats.exposure?.bankTotal ?? null, hasSamples: false },
      preferences: {},
      resources: null,
    };
  }
  return {
    call,
    session,
    bootstrap,
    history,
    async restore() {
      await prepareAuth();
      if (location?.hash.startsWith("#/restablecer"))
        return { authRecovery: true };
      const pending = pendingProfile?.get();
      const { data } = await client.auth.getSession();
      if (pending && data.session?.user?.email === pending.email) {
        await call("profile-update", { body: pending.values });
        pendingProfile.clear();
      }
      return bootstrap();
    },
    async authenticate(signup, input) {
      remember(Boolean(input.remember));
      if (signup) {
        const values = {
          displayName: [input.name, input.lastname].filter(Boolean).join(" "),
          targetSpecialty: input.specialty || null,
        };
        pendingProfile?.set({ email: input.email, values });
        const { data, error } = await client.auth.signUp({
          email: input.email,
          password: input.password,
          options: { emailRedirectTo: `${location.origin}/` },
        });
        failAuth(error);
        if (!data.session) return { confirmationRequired: true };
        await call("profile-update", { body: values });
        pendingProfile?.clear();
      } else {
        const { error } = await client.auth.signInWithPassword({
          email: input.email,
          password: input.password,
        });
        failAuth(error);
        const pending = pendingProfile?.get();
        if (pending?.email === input.email) {
          await call("profile-update", { body: pending.values });
          pendingProfile.clear();
        }
      }
      return bootstrap();
    },
    async logout() {
      const { error } = await client.auth.signOut({ scope: "local" });
      failAuth(error);
      revealed.clear();
    },
    async forgot(email) {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/?auth=recovery`,
      });
      failAuth(error);
    },
    async reset({ password }) {
      await prepareAuth();
      const { data } = await client.auth.getSession();
      if (!data.session)
        throw new ApiError(
          "Abre el enlace de recuperación más reciente en el navegador donde lo solicitaste.",
          401,
        );
      const { error } = await client.auth.updateUser({ password });
      failAuth(error);
      const out = await client.auth.signOut({ scope: "local" });
      failAuth(out.error);
    },
    profile: (body) =>
      call("profile-update", {
        body: {
          displayName: body.name?.trim() || null,
          targetSpecialty: body.specialty?.trim() || null,
        },
      }),
    filterOptions: (selectedAreas) =>
      call("quiz-filter-options", { body: { areas: selectedAreas } }),
    async start({
      mode,
      count,
      areas: selectedAreas = [],
      topics = [],
      specialties = [],
      tags = [],
    }) {
      if (!modes[mode])
        throw new ApiError("Selecciona una modalidad válida.", 400);
      const body = {
        activityType: modes[mode],
        activitySource: "quizzes",
        questionCount: count,
      };
      if (mode === "personalizado")
        Object.assign(body, {
          selectedAreas,
          selectedTopics: topics,
          selectedSpecialties: specialties,
          selectedTags: tags,
        });
      const raw = await call("quiz-start", { body, retry: false });
      return session(raw.sessionId);
    },
    async patchSession(id, { answers }) {
      const entries = Object.entries(answers || {});
      if (entries.length !== 1)
        throw new ApiError(
          "Envía una sola respuesta y continúa desde el estado del servidor.",
          400,
        );
      await call("quiz-answer", {
        body: {
          sessionQuestionId: entries[0][0],
          selectedAnswer: entries[0][1],
        },
        retry: false,
      });
      return session(id);
    },
    async reveal(id, questionId) {
      const raw = await call("quiz-state", { body: { sessionId: id } });
      if (
        raw.activityType !== "flashcards" ||
        raw.currentQuestion?.sessionQuestionId !== questionId
      )
        throw new ApiError("Revela la tarjeta actual.", 409);
      revealed.add(`${id}/${questionId}`);
      return normalizeSession(raw, revealed);
    },
    async rate(id, questionId, rating) {
      const value = Object.keys(ratings).find((k) => ratings[k] === rating);
      if (!value) throw new ApiError("Elige una dificultad válida.", 400);
      await call("quiz-rate-question", {
        body: { sessionQuestionId: questionId, rating: value },
        retry: false,
      });
      return session(id);
    },
    async finish(id) {
      await call("quiz-finish", {
        body: { sessionId: id, action: "finish" },
        retry: false,
      });
      return session(id);
    },
    async pause(id) {
      await call("quiz-finish", {
        body: { sessionId: id, action: "pause" },
        retry: false,
      });
      return session(id);
    },
    async resume(id) {
      await call("quiz-finish", {
        body: { sessionId: id, action: "resume" },
        retry: false,
      });
      return session(id);
    },
    mark: (globalKey, marked) =>
      call("marked-questions", {
        method: marked ? "POST" : "DELETE",
        body: { globalKey },
        retry: false,
      }),
    async startMission() {
      const raw = await call("enarmapa-start", { body: {}, retry: false });
      if (raw.status === "rest_ready") return { rest: true };
      const id = raw.quiz?.sessionId || raw.sessionId;
      if (!id)
        throw new ApiError(
          "La misión no pudo iniciarse. Actualiza tu ruta.",
          409,
        );
      return session(id);
    },
    completeRest: () =>
      call("enarmapa-complete-rest", { body: {}, retry: false }),
    stats: async () =>
      normalizeStats(await call("stats-summary", { method: "GET" })),
    analysis: () => call("stats-analysis", { method: "GET" }),
  };
}
