import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { app } from "./app.js";

await prisma.$connect();
logger.info("database_connected", { schema: "feeti_blog" });

const server = app.listen(env.PORT, () => {
  logger.info("server_started", { port: env.PORT, mode: env.NODE_ENV });
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info("server_shutdown_started", { signal });
  server.close((error) => {
    if (error) {
      logger.error("server_shutdown_failed", { signal, errorName: error.name });
      process.exitCode = 1;
    }

    void prisma.$disconnect().catch((disconnectError: unknown) => {
      const errorName = disconnectError instanceof Error ? disconnectError.name : "UnknownError";
      logger.error("database_disconnect_failed", { signal, errorName });
      process.exitCode = 1;
    });
  });
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => shutdown(signal));
}
