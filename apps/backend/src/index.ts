import { createServer } from "node:http";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { runMigrations } from "./db/migrate.js";
import { HistoryRepository } from "./db/repositories/historyRepository.js";
import { PrinterRepository } from "./db/repositories/printerRepository.js";
import { SettingsRepository } from "./db/repositories/settingsRepository.js";
import { PrinterPollService } from "./services/polling/printerPollService.js";
import { PollingScheduler } from "./services/polling/scheduler.js";
import { SnmpClient } from "./services/snmp/snmpClient.js";
import { logger } from "./utils/logger.js";

async function main() {
  runMigrations();

  const settingsRepository = new SettingsRepository();
  settingsRepository.ensureDefaults();

  const printerRepository = new PrinterRepository();
  const historyRepository = new HistoryRepository();
  const snmpClient = new SnmpClient();
  const pollService = new PrinterPollService(
    printerRepository,
    historyRepository,
    settingsRepository,
    snmpClient
  );
  const scheduler = new PollingScheduler(
    pollService,
    settingsRepository,
    historyRepository
  );

  const app = createApp({
    printerRepository,
    historyRepository,
    settingsRepository,
    pollService,
    scheduler
  });

  const server = createServer(app);

  server.listen(env.port, env.host, () => {
    logger.info(`Backend listening on http://${env.host}:${env.port}`);
  });

  scheduler.start();

  const shutdown = () => {
    logger.info("Shutting down printer monitor.");
    scheduler.stop();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void main();
