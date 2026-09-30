import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
const config = loadConfig();
const app = await createApp({
  config,
  serveStatic: config.serveFrontend,
});
await app.listen({ host: config.host, port: config.port });
for (const signal of ["SIGTERM", "SIGINT"])
  process.once(signal, async () => {
    await app.close();
    process.exit(0);
  });
