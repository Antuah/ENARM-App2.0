import { areas, missions } from "../src/catalog.js";
import { ApiError } from "./security.js";

export const isCards = (mode) => ["flashcards", "inteligente"].includes(mode);
export const iso = (value) => (value ? new Date(value).toISOString() : null);
export const localDay = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
export const shiftDay = (day, delta) => {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
};
export function publicProfile(user) {
  return {
    id: user.id,
    name: user.name,
    lastname: user.lastname,
    email: user.email,
    specialty: user.specialty,
    target: user.target,
    plan: user.plan === "premium" ? "Premium" : "Básico",
    preferences: user.preferences,
  };
}
export function publicQuestion(row) {
  return {
    id: row.id,
    area: row.area,
    topic: row.topic,
    text: row.text,
    options: row.options,
    sample: row.sample,
  };
}
export async function getSession(db, userId, id) {
  const { rows: sessions } = await db.query(
    "SELECT * FROM quiz_sessions WHERE id=$1 AND user_id=$2",
    [id, userId],
  );
  const session = sessions[0];
  if (!session) throw new ApiError(404, "No se encontró esta actividad.");
  const { rows } = await db.query(
    "SELECT * FROM session_questions WHERE session_id=$1 ORDER BY position",
    [id],
  );
  const completed = session.status === "completed";
  const questions = rows.map((row) =>
    completed || (isCards(session.mode) && row.revealed_at)
      ? row.snapshot
      : publicQuestion(row.snapshot),
  );
  const answers = Object.fromEntries(
    rows.filter((r) => r.answer !== null).map((r) => [r.question_id, r.answer]),
  );
  return {
    id: session.id,
    status: session.status,
    mode: session.mode,
    title: session.title,
    mission: session.mission,
    current: session.current_index,
    requestedCount: session.requested_count,
    tokenCost: session.token_cost,
    questions,
    answers,
    ratings: rows.filter((r) => r.rating !== null).map((r) => r.rating),
    ratedIds: rows.filter((r) => r.rating !== null).map((r) => r.question_id),
    started: iso(session.created_at),
    finished: iso(session.finished_at),
    total: session.total,
    correct: session.correct,
    score: session.score,
    isCards: isCards(session.mode),
    date: new Intl.DateTimeFormat("es-MX", {
      timeZone: "America/Mexico_City",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(session.finished_at || session.created_at)),
  };
}
export async function getResources(db, user) {
  const { rows } = await db.query(
    "SELECT spent FROM daily_usage WHERE user_id=$1 AND day=$2::date",
    [user.id, localDay()],
  );
  return {
    dailyTokens: Math.max(0, 10 - (rows[0]?.spent || 0)),
    bonusTokens: user.bonus_tokens,
    unlimited: user.plan === "premium",
    wildcards: 0,
  };
}
export async function getStats(db, userId, period = "week") {
  const { rows: areaRows } = await db.query(
    `SELECT sq.snapshot->>'area' AS area, count(*)::int AS total,
    sum(CASE WHEN sq.answer=(sq.snapshot->>'answer')::int THEN 1 ELSE 0 END)::int AS correct,
    count(DISTINCT sq.question_id)::int AS unique_count
    FROM session_questions sq JOIN quiz_sessions s ON s.id=sq.session_id
    WHERE s.user_id=$1 AND s.status='completed' AND s.mode NOT IN ('flashcards','inteligente') GROUP BY sq.snapshot->>'area'`,
    [userId],
  );
  const areaStats = areas.map((area) => {
    const row = areaRows.find((r) => r.area === area.name);
    return {
      ...area,
      total: row?.total || 0,
      correct: row?.correct || 0,
      uniqueCount: row?.unique_count || 0,
      score: row?.total ? Math.round((row.correct / row.total) * 100) : null,
    };
  });
  const total = areaStats.reduce((n, a) => n + a.total, 0);
  const correct = areaStats.reduce((n, a) => n + a.correct, 0);
  const unique = areaStats.reduce((n, a) => n + a.uniqueCount, 0);
  const { rows: bank } = await db.query(
    "SELECT count(*)::int AS total FROM questions WHERE active",
  );
  const { rows: recent } = await db.query(
    `SELECT sq.answer, (sq.snapshot->>'answer')::int AS correct_answer
    FROM session_questions sq JOIN quiz_sessions s ON s.id=sq.session_id
    WHERE s.user_id=$1 AND s.status='completed' AND s.mode NOT IN ('flashcards','inteligente')
    ORDER BY s.finished_at DESC,s.id,sq.position DESC LIMIT 280`,
    [userId],
  );
  const { rows: study } = await db.query(
    "SELECT day::text AS day FROM study_days WHERE user_id=$1 ORDER BY day DESC",
    [userId],
  );
  const today = localDay();
  const days = new Set(study.map((r) => r.day));
  let cursor = days.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  const weekday = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7;
  const monday = shiftDay(today, -weekday);
  const from = period === "month" ? shiftDay(today, -27) : monday;
  const { rows: byDay } = await db.query(
    `SELECT to_char(s.finished_at AT TIME ZONE 'America/Mexico_City','YYYY-MM-DD') AS day,
    count(*)::int AS total,sum(CASE WHEN sq.answer=(sq.snapshot->>'answer')::int THEN 1 ELSE 0 END)::int AS correct
    FROM session_questions sq JOIN quiz_sessions s ON s.id=sq.session_id WHERE s.user_id=$1 AND s.status='completed'
    AND s.mode NOT IN ('flashcards','inteligente') AND s.finished_at >= ($2::date::timestamp AT TIME ZONE 'America/Mexico_City')
    GROUP BY to_char(s.finished_at AT TIME ZONE 'America/Mexico_City','YYYY-MM-DD')`,
    [userId, from],
  );
  const chart = Array.from({ length: period === "month" ? 4 : 7 }, (_, i) => {
    const start = shiftDay(from, period === "month" ? i * 7 : i);
    const end = shiftDay(start, period === "month" ? 6 : 0);
    const group = byDay.filter((d) => d.day >= start && d.day <= end);
    const total = group.reduce((n, d) => n + d.total, 0);
    const correct = group.reduce((n, d) => n + d.correct, 0);
    return {
      label:
        period === "month"
          ? `Semana ${i + 1}`
          : ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
      day: start,
      average: total ? Number(((correct / total) * 10).toFixed(2)) : null,
      total,
    };
  });
  const ordered = areaStats
    .filter((a) => a.total > 0)
    .sort((a, b) => b.score - a.score);
  return {
    total,
    correct,
    incorrect: total - correct,
    unique,
    average: total ? Number(((correct / total) * 10).toFixed(2)) : null,
    recentAverage: recent.length
      ? Number(
          (
            (recent.filter((r) => r.answer === r.correct_answer).length /
              recent.length) *
            10
          ).toFixed(2),
        )
      : null,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    exposure: bank[0].total
      ? Math.min(100, Math.round((unique / bank[0].total) * 100))
      : 0,
    bankTotal: bank[0].total,
    streak,
    weekDays: ["L", "M", "M", "J", "V", "S", "D"].map((label, i) => ({
      label,
      studied: days.has(shiftDay(monday, i)),
      today: shiftDay(monday, i) === today,
    })),
    chart,
    areaStats,
    bestArea: ordered[0] || null,
    weakestArea: ordered.at(-1) || null,
  };
}
export async function getCatalog(db) {
  const { rows } = await db.query(
    "SELECT area,topic,count(*)::int AS count,bool_or(sample) AS sample FROM questions WHERE active GROUP BY area,topic ORDER BY area,topic",
  );
  return {
    total: rows.reduce((n, r) => n + r.count, 0),
    hasSamples: rows.some((r) => r.sample),
    topics: rows.map((r) => ({ name: r.topic, area: r.area, count: r.count })),
    areas: areas.map((a) => ({
      ...a,
      count: rows
        .filter((r) => r.area === a.name)
        .reduce((n, r) => n + r.count, 0),
    })),
  };
}
export async function bootstrap(db, user) {
  const { rows: fresh } = await db.query("SELECT * FROM users WHERE id=$1", [
    user.id,
  ]);
  user = fresh[0];
  const { rows: bookmarks } = await db.query(
    "SELECT q.* FROM bookmarks b JOIN questions q ON q.id=b.question_id WHERE b.user_id=$1 ORDER BY b.created_at DESC",
    [user.id],
  );
  const { rows: progress } = await db.query(
    "SELECT day FROM mission_progress WHERE user_id=$1 ORDER BY day",
    [user.id],
  );
  const { rows: history } = await db.query(
    "SELECT id,title,mode,total,correct,score,mission,finished_at FROM quiz_sessions WHERE user_id=$1 AND status='completed' ORDER BY finished_at DESC LIMIT 100",
    [user.id],
  );
  const { rows: active } = await db.query(
    "SELECT id FROM quiz_sessions WHERE user_id=$1 AND status='active'",
    [user.id],
  );
  const catalog = await getCatalog(db);
  const stats = await getStats(db, user.id);
  const resources = await getResources(db, user);
  return {
    profile: publicProfile(user),
    preferences: user.preferences,
    marked: bookmarks.map((q) => q.id),
    markedQuestions: bookmarks.map(publicQuestion),
    completed: progress.map((r) => r.day),
    history: history.map((h) => ({
      ...h,
      isCards: isCards(h.mode),
      date: new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Mexico_City",
      }).format(new Date(h.finished_at)),
    })),
    activeSession: active.length
      ? await getSession(db, user.id, active[0].id)
      : null,
    resources,
    stats,
    catalog,
    missions,
  };
}
