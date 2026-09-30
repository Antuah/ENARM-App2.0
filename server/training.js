import { randomUUID } from "node:crypto";
import { z } from "zod";
import { activities, missions } from "../src/catalog.js";
import {
  sessionInput,
  sessionPatch,
  reviewInput,
  uuid,
  questionId,
} from "./validation.js";
import { ApiError, requireValue } from "./security.js";
import { getSession, isCards, localDay, publicQuestion } from "./state.js";

const missionAreas = [
  null,
  "Ginecología y Obstetricia",
  "Pediatría",
  "Cirugía",
  "Medicina Interna",
  null,
  null,
];
export function trainingRoutes(app, { db }) {
  const auth = { config: { auth: true } };
  async function lockSession(tx, userId, id) {
    const { rows } = await tx.query(
      "SELECT * FROM quiz_sessions WHERE id=$1 AND user_id=$2 FOR UPDATE",
      [id, userId],
    );
    return requireValue(rows[0], 404, "No se encontró esta actividad.");
  }
  app.post("/api/sessions", auth, async (request, reply) => {
    const input = sessionInput.parse(request.body);
    const id = randomUUID();
    await db.transaction(async (tx) => {
      const { rows: users } = await tx.query(
        "SELECT * FROM users WHERE id=$1 FOR UPDATE",
        [request.user.id],
      );
      const user = users[0];
      const { rows: active } = await tx.query(
        "SELECT id FROM quiz_sessions WHERE user_id=$1 AND status='active'",
        [user.id],
      );
      if (active.length)
        throw new ApiError(
          409,
          "Ya tienes una actividad en curso. Continúala o ciérrala antes de empezar otra.",
          "ACTIVE_SESSION",
        );
      if (input.mission !== null) {
        input.count = 20;
        const { rows: progress } = await tx.query(
          "SELECT day FROM mission_progress WHERE user_id=$1",
          [user.id],
        );
        if (
          Array.from({ length: input.mission }, (_, i) => i).some(
            (i) => !progress.some((p) => p.day === i),
          )
        )
          throw new ApiError(
            403,
            "Completa las misiones anteriores para desbloquear este día.",
            "MISSION_LOCKED",
          );
        input.mode = input.mission === 6 ? "inteligente" : "rapido";
        input.areas = missionAreas[input.mission]
          ? [missionAreas[input.mission]]
          : [];
        input.topics = [];
      }
      if (input.mode === "personalizado" && !input.areas.length)
        throw new ApiError(400, "Selecciona al menos un área.");
      const params = [user.id];
      const filters = ["q.active"];
      if (input.areas.length) {
        params.push(input.areas);
        filters.push(`q.area=ANY($${params.length}::text[])`);
      }
      if (input.topics.length) {
        params.push(input.topics);
        filters.push(`q.topic=ANY($${params.length}::text[])`);
      }
      if (input.mode === "flashcards")
        filters.push(
          "EXISTS(SELECT 1 FROM bookmarks b WHERE b.user_id=$1 AND b.question_id=q.id)",
        );
      // Review modes use the most recent graded attempt of each question. Resolved errors leave the queue.
      if (["repaso", "inteligente"].includes(input.mode) && input.mission !== 6)
        filters.push(`EXISTS(SELECT 1 FROM
        (SELECT DISTINCT ON (sq.question_id) sq.question_id,sq.answer,(sq.snapshot->>'answer')::int AS correct_answer
        FROM session_questions sq JOIN quiz_sessions s ON s.id=sq.session_id
        WHERE s.user_id=$1 AND s.status='completed' AND s.mode NOT IN ('flashcards','inteligente')
        ORDER BY sq.question_id,s.finished_at DESC,s.id DESC) latest
        WHERE latest.question_id=q.id AND latest.answer IS DISTINCT FROM latest.correct_answer)`);
      params.push(input.count);
      // $1 remains the authenticated user, even in modes without personalized filtering.
      const { rows: pool } = await tx.query(
        `SELECT q.* FROM questions q WHERE $1::uuid IS NOT NULL AND ${filters.join(" AND ")} ORDER BY random() LIMIT $${params.length}`,
        params,
      );
      if (!pool.length)
        throw new ApiError(
          422,
          input.mode === "flashcards"
            ? "Marca una pregunta para crear tus flashcards."
            : ["repaso", "inteligente"].includes(input.mode)
              ? "Aún no hay errores para repasar. Completa un quiz primero."
              : "No hay preguntas disponibles con esta configuración.",
          "EMPTY_BANK",
        );
      const cost =
        user.plan === "premium" || input.mission !== null
          ? 0
          : Math.ceil(pool.length / 5);
      const today = localDay();
      await tx.query(
        "INSERT INTO daily_usage(user_id,day) VALUES($1,$2::date) ON CONFLICT DO NOTHING",
        [user.id, today],
      );
      const { rows: usage } = await tx.query(
        "SELECT spent FROM daily_usage WHERE user_id=$1 AND day=$2::date FOR UPDATE",
        [user.id, today],
      );
      const available = 10 - usage[0].spent;
      if (cost > available + user.bonus_tokens)
        throw new ApiError(
          402,
          "No tienes suficientes tokens para esta actividad.",
          "INSUFFICIENT_TOKENS",
        );
      const dailyCost = Math.min(cost, available);
      const bonusCost = cost - dailyCost;
      await tx.query(
        "UPDATE daily_usage SET spent=spent+$3 WHERE user_id=$1 AND day=$2::date",
        [user.id, today, dailyCost],
      );
      if (bonusCost)
        await tx.query(
          "UPDATE users SET bonus_tokens=bonus_tokens-$2 WHERE id=$1",
          [user.id, bonusCost],
        );
      const title =
        input.mission !== null
          ? missions[input.mission]
          : activities.find((a) => a.id === input.mode).title;
      await tx.query(
        "INSERT INTO quiz_sessions(id,user_id,mode,title,requested_count,token_cost,mission,config,total) VALUES($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9)",
        [
          id,
          user.id,
          input.mode,
          title,
          input.count,
          cost,
          input.mission,
          JSON.stringify({ areas: input.areas, topics: input.topics }),
          pool.length,
        ],
      );
      for (const [position, q] of pool.entries()) {
        const snapshot = {
          ...publicQuestion(q),
          answer: q.answer,
          explanation: q.explanation,
        };
        await tx.query(
          "INSERT INTO session_questions(session_id,question_id,position,snapshot) VALUES($1,$2,$3,$4::jsonb)",
          [id, q.id, position, JSON.stringify(snapshot)],
        );
      }
    });
    reply.code(201);
    return getSession(db, request.user.id, id);
  });
  app.get("/api/sessions/:id", auth, (request) =>
    getSession(db, request.user.id, uuid.parse(request.params.id)),
  );
  app.patch("/api/sessions/:id", auth, async (request) => {
    const id = uuid.parse(request.params.id);
    const input = sessionPatch.parse(request.body);
    await db.transaction(async (tx) => {
      const session = await lockSession(tx, request.user.id, id);
      if (session.status !== "active")
        throw new ApiError(409, "La actividad ya está cerrada.");
      if (input.current !== undefined) {
        if (input.current >= session.total)
          throw new ApiError(
            400,
            "Esa pregunta no pertenece a esta actividad.",
          );
        await tx.query(
          "UPDATE quiz_sessions SET current_index=$2 WHERE id=$1",
          [id, input.current],
        );
      }
      if (input.answers) {
        if (isCards(session.mode))
          throw new ApiError(400, "Usa la autoevaluación para las tarjetas.");
        for (const [key, answer] of Object.entries(input.answers)) {
          const { rows } = await tx.query(
            "UPDATE session_questions SET answer=$3 WHERE session_id=$1 AND question_id=$2 RETURNING question_id",
            [id, Number(key), answer],
          );
          if (!rows.length)
            throw new ApiError(
              400,
              "Esa pregunta no pertenece a esta actividad.",
            );
        }
      }
    });
    return getSession(db, request.user.id, id);
  });
  app.post(
    "/api/sessions/:id/questions/:questionId/reveal",
    auth,
    async (request) => {
      const id = uuid.parse(request.params.id);
      const qid = questionId.parse(request.params.questionId);
      await db.transaction(async (tx) => {
        const session = await lockSession(tx, request.user.id, id);
        if (session.status !== "active" || !isCards(session.mode))
          throw new ApiError(
            409,
            "Esta actividad no permite revelar la respuesta.",
          );
        const { rows } = await tx.query(
          "UPDATE session_questions SET revealed_at=COALESCE(revealed_at,now()) WHERE session_id=$1 AND question_id=$2 RETURNING question_id",
          [id, qid],
        );
        if (!rows.length)
          throw new ApiError(404, "No se encontró esa tarjeta.");
      });
      return getSession(db, request.user.id, id);
    },
  );
  app.post("/api/sessions/:id/review", auth, async (request) => {
    const id = uuid.parse(request.params.id);
    const input = reviewInput.parse(request.body);
    await db.transaction(async (tx) => {
      const session = await lockSession(tx, request.user.id, id);
      if (session.status !== "active" || !isCards(session.mode))
        throw new ApiError(409, "Esta actividad no permite autoevaluación.");
      const { rows } = await tx.query(
        "SELECT revealed_at,rating FROM session_questions WHERE session_id=$1 AND question_id=$2",
        [id, input.questionId],
      );
      if (!rows[0]?.revealed_at)
        throw new ApiError(400, "Revela primero la respuesta de la tarjeta.");
      if (rows[0].rating !== null && rows[0].rating !== input.rating)
        throw new ApiError(409, "Esta tarjeta ya fue evaluada.");
      await tx.query(
        "UPDATE session_questions SET rating=$3 WHERE session_id=$1 AND question_id=$2",
        [id, input.questionId, input.rating],
      );
      const { rows: next } = await tx.query(
        "SELECT position FROM session_questions WHERE session_id=$1 AND rating IS NULL ORDER BY position LIMIT 1",
        [id],
      );
      if (next[0])
        await tx.query(
          "UPDATE quiz_sessions SET current_index=$2 WHERE id=$1",
          [id, next[0].position],
        );
    });
    return getSession(db, request.user.id, id);
  });
  app.post("/api/sessions/:id/finish", auth, async (request) => {
    const id = uuid.parse(request.params.id);
    await db.transaction(async (tx) => {
      // All progression and token changes acquire the same user lock before the session lock.
      await tx.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [
        request.user.id,
      ]);
      const session = await lockSession(tx, request.user.id, id);
      if (session.status === "completed") return;
      if (session.status !== "active")
        throw new ApiError(409, "La actividad fue cerrada sin finalizar.");
      const { rows } = await tx.query(
        "SELECT * FROM session_questions WHERE session_id=$1 ORDER BY position",
        [id],
      );
      if (isCards(session.mode) && rows.some((r) => r.rating === null))
        throw new ApiError(422, "Evalúa todas las tarjetas antes de terminar.");
      if (!isCards(session.mode) && !rows.some((r) => r.answer !== null))
        throw new ApiError(
          422,
          "Responde al menos una pregunta para completar el entrenamiento.",
        );
      if (
        session.mission !== null &&
        !isCards(session.mode) &&
        rows.some((r) => r.answer === null)
      )
        throw new ApiError(
          422,
          "Responde todas las preguntas para completar esta misión.",
        );
      const correct = rows.filter((r) =>
        isCards(session.mode)
          ? r.rating === "Fácil"
          : r.answer === r.snapshot.answer,
      ).length;
      await tx.query(
        "UPDATE quiz_sessions SET status='completed',finished_at=now(),correct=$2,score=$3 WHERE id=$1",
        [id, correct, Math.round((correct / rows.length) * 100)],
      );
      await tx.query(
        "INSERT INTO study_days(user_id,day) VALUES($1,$2::date) ON CONFLICT DO NOTHING",
        [request.user.id, localDay()],
      );
      if (session.mission !== null) {
        const { rows: awarded } = await tx.query(
          "INSERT INTO mission_progress(user_id,day,session_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING day",
          [request.user.id, session.mission, id],
        );
        if (awarded.length)
          await tx.query(
            "UPDATE users SET bonus_tokens=LEAST(30,bonus_tokens+$2) WHERE id=$1",
            [request.user.id, session.mission === 6 ? 6 : 1],
          );
      }
    });
    return getSession(db, request.user.id, id);
  });
  app.post("/api/sessions/:id/abandon", auth, async (request) => {
    const id = uuid.parse(request.params.id);
    await db.transaction(async (tx) => {
      const session = await lockSession(tx, request.user.id, id);
      if (session.status === "completed")
        throw new ApiError(409, "La actividad ya fue completada.");
      await tx.query(
        "UPDATE quiz_sessions SET status='abandoned',finished_at=COALESCE(finished_at,now()) WHERE id=$1",
        [id],
      );
    });
    return { ok: true };
  });
  app.put("/api/bookmarks/:questionId", auth, async (request) => {
    const id = questionId.parse(request.params.questionId);
    const { marked } = z
      .object({ marked: z.boolean() })
      .strict()
      .parse(request.body);
    const { rows } = await db.query("SELECT id FROM questions WHERE id=$1", [
      id,
    ]);
    if (!rows.length) throw new ApiError(404, "No se encontró esa pregunta.");
    if (marked)
      await db.query(
        "INSERT INTO bookmarks(user_id,question_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
        [request.user.id, id],
      );
    else
      await db.query(
        "DELETE FROM bookmarks WHERE user_id=$1 AND question_id=$2",
        [request.user.id, id],
      );
    return { id, marked };
  });
}
