import { existsSync } from "node:fs";
import { join } from "node:path";

import express, { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";

import { createDashboardRouter } from "./api/routes/dashboard.js";
import { createPrinterRouter } from "./api/routes/printers.js";
import { createSettingsRouter } from "./api/routes/settings.js";
import { env } from "./config/env.js";
import { HistoryRepository } from "./db/repositories/historyRepository.js";
import { PrinterRepository } from "./db/repositories/printerRepository.js";
import { SettingsRepository } from "./db/repositories/settingsRepository.js";
import { PrinterPollService } from "./services/polling/printerPollService.js";
import { PollingScheduler } from "./services/polling/scheduler.js";
import { HttpError } from "./utils/httpError.js";
import { logger } from "./utils/logger.js";

interface AppDependencies {
  printerRepository: PrinterRepository;
  historyRepository: HistoryRepository;
  settingsRepository: SettingsRepository;
  pollService: PrinterPollService;
  scheduler: PollingScheduler;
}

export function createApp(dependencies: AppDependencies) {
  const app = express();
  const hasFrontendBuild = existsSync(join(env.frontendDistDir, "index.html"));

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({
      ok: true,
      environment: env.nodeEnv
    });
  });

  app.use(
    "/api/dashboard",
    createDashboardRouter(dependencies.printerRepository)
  );
  app.use(
    "/api/printers",
    createPrinterRouter(
      dependencies.printerRepository,
      dependencies.historyRepository,
      dependencies.pollService
    )
  );
  app.use(
    "/api/settings",
    createSettingsRouter(dependencies.settingsRepository, dependencies.scheduler)
  );

  if (hasFrontendBuild) {
    app.use(express.static(env.frontendDistDir, { index: false }));

    app.use((request, response, next) => {
      if (request.path.startsWith("/api")) {
        next();
        return;
      }

      response.sendFile(join(env.frontendDistDir, "index.html"));
    });
  }

  app.use((request, response) => {
    response.status(404).json({
      message: `Neznámá cesta: ${request.method} ${request.path}`
    });
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: "Neplatná vstupní data.",
        issues: error.issues
      });
      return;
    }

    if (error instanceof HttpError) {
      response.status(error.status).json({
        message: error.message
      });
      return;
    }

    logger.error("Unhandled backend error.", error);
    response.status(500).json({
      message: "Neočekávaná chyba serveru."
    });
  });

  return app;
}
