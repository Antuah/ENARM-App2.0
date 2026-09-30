import { randomBytes, createHash, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
const options = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export const randomToken = () => randomBytes(32).toString("base64url");
export const tokenHash = (token) =>
  createHash("sha256").update(token).digest("hex");
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await derive(password, salt, 64, options);
  return `scrypt$32768$8$1$${salt}$${key.toString("hex")}`;
}
export async function verifyPassword(password, hash) {
  const parts = hash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const key = await derive(password, parts[4], 64, options);
  const expected = Buffer.from(parts[5], "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}
export class ApiError extends Error {
  constructor(statusCode, message, code = "REQUEST_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
export function requireValue(value, statusCode, message, code) {
  if (!value) throw new ApiError(statusCode, message, code);
  return value;
}
