import { Router } from "express";
import { settingsFormSchema } from "@tisk/shared";

import { SettingsRepository } from "../../db/repositories/settingsRepository.js";
import { PollingScheduler } from "../../services/polling/scheduler.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export function createSettingsRouter(
  settingsRepository: SettingsRepository,
  scheduler: PollingScheduler
) {
  const router = Router();

  router.get("/", (_request, response) => {
    response.json(settingsRepository.getSettings());
  });

  router.put(
    "/",
    asyncHandler(async (request, response) => {
      const parsed = settingsFormSchema.parse(request.body);
      const settings = settingsRepository.updateSettings(parsed);
      scheduler.refresh();
      response.json(settings);
    })
  );

  return router;
}
