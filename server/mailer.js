import nodemailer from "nodemailer";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { ApiError } from "./security.js";

export function createMailer(config) {
  const transport = config.smtpHost
    ? nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        requireTLS: !config.smtpSecure,
        ...(config.smtpUser
          ? { auth: { user: config.smtpUser, pass: config.smtpPassword } }
          : {}),
      })
    : null;
  return {
    available: !!transport || !config.production,
    async sendReset(email, url) {
      const message = {
        from: config.mailFrom,
        to: email,
        subject: "Recupera tu acceso a Entrenarme",
        text: `Abre este enlace para elegir una nueva contraseña:\n\n${url}\n\nEl enlace expira en 30 minutos y solo puede usarse una vez. Si no lo solicitaste, ignora este correo.`,
      };
      if (transport) {
        await transport.sendMail(message);
        return;
      }
      if (config.production)
        throw new ApiError(
          503,
          "La recuperación por correo aún no está disponible.",
        );
      const dir = resolve(config.dataDir, "outbox");
      await mkdir(dir, { recursive: true, mode: 0o700 });
      await writeFile(
        resolve(dir, `${Date.now()}-${randomUUID()}.json`),
        JSON.stringify(message, null, 2),
        { mode: 0o600 },
      );
    },
  };
}
