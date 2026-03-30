import type { PollResult, PrinterSummary } from "@tisk/shared";

import { env } from "../../config/env.js";
import { HistoryRepository } from "../../db/repositories/historyRepository.js";
import { PrinterRepository } from "../../db/repositories/printerRepository.js";
import { SettingsRepository } from "../../db/repositories/settingsRepository.js";
import { HttpError } from "../../utils/httpError.js";
import { logger } from "../../utils/logger.js";
import { nowIso } from "../../utils/time.js";
import { mapWithConcurrency } from "../../utils/concurrency.js";
import { createDevelopIneo250iSampleRawSnapshot } from "../snmp/sampleData.js";
import { SnmpClient } from "../snmp/snmpClient.js";
import { parseRawSnapshotToPollResult } from "../snmp/standardParser.js";

export class PrinterPollService {
  constructor(
    private readonly printerRepository: PrinterRepository,
    private readonly historyRepository: HistoryRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly snmpClient: SnmpClient
  ) {}

  async pollPrinter(printer: PrinterSummary): Promise<PollResult> {
    const settings = this.settingsRepository.getSettings();
    const checkedAt = nowIso();

    try {
      const rawSnapshot = env.snmpMockMode
        ? createDevelopIneo250iSampleRawSnapshot()
        : await this.snmpClient.readPrinter(printer);

      const result = parseRawSnapshotToPollResult({
        rawSnapshot,
        printer,
        checkedAt,
        warningThreshold: settings.tonerWarningThreshold
      });

      this.historyRepository.insert(printer.id, result);
      this.printerRepository.updateWithPollResult(printer.id, result);

      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "SNMP dotaz selhal nebo zařízení neodpovídá.";

      const result: PollResult = {
        printerId: printer.id,
        checkedAt,
        isOnline: false,
        availability: "offline",
        deviceStatus: "Offline",
        pageCounter: null,
        model: printer.model,
        toners: [],
        trays: [],
        errorMessage: message
      };

      this.historyRepository.insert(printer.id, result);
      this.printerRepository.updateWithPollResult(printer.id, result);
      logger.warn(`Poll printer failed: ${printer.name} (${printer.ipAddress})`, message);

      return result;
    }
  }

  async pollPrinterById(printerId: string): Promise<PollResult> {
    const printer = this.printerRepository.getById(printerId);
    if (!printer) {
      throw new HttpError(404, "Tiskárna nebyla nalezena.");
    }

    return this.pollPrinter(printer);
  }

  async pollActivePrinters(): Promise<PollResult[]> {
    const printers = this.printerRepository.listActive();
    if (printers.length === 0) {
      return [];
    }

    logger.info(`Running scheduled poll for ${printers.length} printer(s).`);

    return mapWithConcurrency(printers, env.pollConcurrency, async (printer) =>
      this.pollPrinter(printer)
    );
  }
}
