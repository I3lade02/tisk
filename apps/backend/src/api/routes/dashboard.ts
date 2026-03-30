import { Router } from "express";
import type { TonerLevel } from "@tisk/shared";

import { PrinterRepository } from "../../db/repositories/printerRepository.js";

export function createDashboardRouter(printerRepository: PrinterRepository) {
  const router = Router();

  router.get("/summary", (_request, response) => {
    const printers = printerRepository.listAll();
    const lastCheckAt = printers
      .map((printer) => printer.lastPolledAt)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null;

    response.json({
      total: printers.length,
      active: printers.filter((printer) => printer.isActive).length,
      online: printers.filter((printer) => printer.lastOnline === true).length,
      offline: printers.filter((printer) => printer.isActive && printer.lastOnline === false)
        .length,
      warnings: printers.filter((printer) => printer.lastAvailability === "warning").length,
      errors: printers.filter((printer) => printer.lastAvailability === "error").length,
      lowToner: printers.filter((printer) =>
        printer.latestToners.some(
          (toner: TonerLevel) => toner.state === "low" || toner.state === "empty"
        )
      ).length,
      lastCheckAt
    });
  });

  return router;
}
