import { questionInput } from "./validation.js";
import { sampleQuestions } from "./seed-questions.js";

export async function importQuestions(db, items) {
  const parsed = items.map((item) => questionInput.parse(item));
  const ids = parsed.filter((q) => q.id !== undefined).map((q) => q.id);
  if (new Set(ids).size !== ids.length)
    throw new Error("El archivo contiene IDs de preguntas repetidos.");
  return db.transaction(async (tx) => {
    const imported = [];
    for (const q of parsed) {
      const params = [
        q.area,
        q.topic,
        q.text,
        JSON.stringify(q.options),
        q.answer,
        q.explanation,
        q.active,
        q.sample,
      ];
      const query =
        q.id === undefined
          ? "INSERT INTO questions(area,topic,text,options,answer,explanation,active,sample) VALUES($1,$2,$3,$4::jsonb,$5,$6,$7,$8) RETURNING id"
          : "INSERT INTO questions(id,area,topic,text,options,answer,explanation,active,sample) VALUES($9,$1,$2,$3,$4::jsonb,$5,$6,$7,$8) ON CONFLICT(id) DO UPDATE SET area=excluded.area,topic=excluded.topic,text=excluded.text,options=excluded.options,answer=excluded.answer,explanation=excluded.explanation,active=excluded.active,sample=excluded.sample,updated_at=now() RETURNING id";
      if (q.id !== undefined) params.push(q.id);
      const result = await tx.query(query, params);
      imported.push(result.rows[0].id);
    }
    await tx.query(
      "SELECT setval(pg_get_serial_sequence('questions','id'), COALESCE((SELECT MAX(id) FROM questions), 1), true)",
    );
    return imported;
  });
}
export async function seedSampleBank(db) {
  const { rows } = await db.query(
    "SELECT count(*)::int AS count FROM questions",
  );
  if (!rows[0].count)
    await importQuestions(
      db,
      sampleQuestions.map((q) => ({ ...q, sample: true })),
    );
}
