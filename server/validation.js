import { z } from "zod";
import { areas } from "../src/catalog.js";
export const areaNames = areas.map((a) => a.name);
const name = z.string().trim().min(1).max(60);
const email = z.string().trim().toLowerCase().email().max(254);
export const password = z.string().min(10).max(128);
const specialty = z.enum([...areaNames, "Aún estoy explorando"]);
const target = z.string().regex(/^20\d{2}$/);
export const registerInput = z
  .object({
    name,
    lastname: z.string().trim().max(60).default(""),
    email,
    password,
    specialty: specialty.default("Medicina Interna"),
    target: target.default("2027"),
  })
  .strict();
export const loginInput = z
  .object({
    email,
    password: z.string().min(1).max(128),
    remember: z.boolean().default(false),
  })
  .strict();
export const profileInput = z
  .object({
    name: name.optional(),
    lastname: z.string().trim().max(60).optional(),
    specialty: specialty.optional(),
    target: target.optional(),
    preferences: z
      .object({ reminders: z.boolean(), sound: z.boolean() })
      .strict()
      .optional(),
  })
  .strict();
export const emailInput = z.object({ email }).strict();
export const resetInput = z
  .object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/), password })
  .strict();
export const mode = z.enum([
  "rapido",
  "repaso",
  "inteligente",
  "personalizado",
  "flashcards",
]);
export const sessionInput = z
  .object({
    mode,
    count: z.number().int().min(1).max(100).default(20),
    areas: z.array(z.enum(areaNames)).max(4).default([]),
    topics: z.array(z.string().trim().min(1).max(100)).max(5).default([]),
    mission: z.number().int().min(0).max(6).nullable().default(null),
  })
  .strict();
export const sessionPatch = z
  .object({
    current: z.number().int().min(0).max(99).optional(),
    answers: z
      .record(z.string().regex(/^\d+$/), z.number().int().min(0).max(3))
      .optional(),
  })
  .strict();
export const reviewInput = z
  .object({
    questionId: z.number().int().positive(),
    rating: z.enum(["Difícil", "Regular", "Fácil"]),
  })
  .strict();
export const questionInput = z
  .object({
    id: z.number().int().positive().optional(),
    area: z.enum(areaNames),
    topic: z.string().trim().min(1).max(100),
    text: z.string().trim().min(5).max(10000),
    options: z.array(z.string().trim().min(1).max(3000)).length(4),
    answer: z.number().int().min(0).max(3),
    explanation: z.string().trim().min(1).max(15000),
    active: z.boolean().default(true),
    sample: z.boolean().default(false),
  })
  .strict();
export const uuid = z.string().uuid();
export const questionId = z.coerce.number().int().positive();
