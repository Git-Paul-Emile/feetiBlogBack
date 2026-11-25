import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { app } from "./app.js";

const server = app.listen(env.PORT, () => {
  logger.info("server_started", { port: env.PORT, mode: env.NODE_ENV });
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    logger.info("server_shutdown_started", { signal });
    server.close((error) => {
      if (error) {
        logger.error("server_shutdown_failed", { signal, errorName: error.name });
        process.exitCode = 1;
      }
    });
  });
}
