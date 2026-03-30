import { Router } from "express";
import { printerFormSchema } from "@tisk/shared";

import { HistoryRepository } from "../../db/repositories/historyRepository.js";
import { PrinterRepository } from "../../db/repositories/printerRepository.js";
import { listPrinterProfiles } from "../../services/snmp/profiles/registry.js";
import { PrinterPollService } from "../../services/polling/printerPollService.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HttpError } from "../../utils/httpError.js";

function parseLimit(value: unknown, fallback = 30): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(200, Math.trunc(parsed));
}

function getPrinterIdParam(value: string | string[] | undefined): string {
  if (!value || Array.isArray(value)) {
    throw new HttpError(400, "Chybí nebo je neplatné ID tiskárny.");
  }

  return value;
}

export function createPrinterRouter(
  printerRepository: PrinterRepository,
  historyRepository: HistoryRepository,
  pollService: PrinterPollService
) {
  const router = Router();

  router.get("/", (_request, response) => {
    response.json({
      items: printerRepository.listAll(),
      profiles: listPrinterProfiles()
    });
  });

  router.get(
    "/:id",
    asyncHandler(async (request, response) => {
      const printerId = getPrinterIdParam(request.params.id);
      const printer = printerRepository.getById(printerId);
      if (!printer) {
        throw new HttpError(404, "Tiskárna nebyla nalezena.");
      }

      response.json({
        ...printer,
        history: historyRepository.listByPrinterId(printer.id, 30),
        rawSnapshot: printerRepository.getLastSnapshot(printer.id)?.rawSnapshot ?? null
      });
    })
  );

  router.get(
    "/:id/history",
    asyncHandler(async (request, response) => {
      const printerId = getPrinterIdParam(request.params.id);
      const printer = printerRepository.getById(printerId);
      if (!printer) {
        throw new HttpError(404, "Tiskárna nebyla nalezena.");
      }

      response.json(historyRepository.listByPrinterId(printer.id, parseLimit(request.query.limit)));
    })
  );

  router.post(
    "/",
    asyncHandler(async (request, response) => {
      const parsed = printerFormSchema.parse(request.body);
      const printer = printerRepository.create(parsed);
      response.status(201).json(printer);
    })
  );

  router.put(
    "/:id",
    asyncHandler(async (request, response) => {
      const printerId = getPrinterIdParam(request.params.id);
      const parsed = printerFormSchema.parse(request.body);
      const printer = printerRepository.update(printerId, parsed);
      response.json(printer);
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (request, response) => {
      const printerId = getPrinterIdParam(request.params.id);
      printerRepository.delete(printerId);
      response.status(204).send();
    })
  );

  router.post(
    "/:id/poll",
    asyncHandler(async (request, response) => {
      const printerId = getPrinterIdParam(request.params.id);
      const result = await pollService.pollPrinterById(printerId);
      response.json(result);
    })
  );

  return router;
}
