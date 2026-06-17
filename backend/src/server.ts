import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { connectDB } from "./config/db";
import { connectRedis, disconnectRedis } from "./lib/redis";
import { closeQueues } from "./lib/queue";
import { initializeSocket, closeSocket } from "./lib/socket";
import { startWorkers, stopWorkers } from "./workers";
import { registerAllListeners } from "./listeners";
import app from "./app";

let server: http.Server;

async function startServer() {
  await connectDB();
  await connectRedis();
  await startWorkers();

  server = http.createServer(app);
  
  initializeSocket(server);
  
  registerAllListeners();

  server.listen(env.PORT, () => {
    logger.info(`Server is running on port ${env.PORT}`);
    logger.info(`WebSocket server ready`);
  });
}

async function gracefulShutdown(signal: string) {
  logger.info({ signal }, "Received shutdown signal");

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await closeSocket();
      await stopWorkers();
      await closeQueues();
      await disconnectRedis();
      logger.info("All connections closed gracefully");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "Error during graceful shutdown");
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.warn("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer().catch((error) => {
  logger.fatal({ err: error }, "Failed to start server");
  process.exit(1);
});
