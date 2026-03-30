import { HistoryRepository } from "../../db/repositories/historyRepository.js";
import { SettingsRepository } from "../../db/repositories/settingsRepository.js";
import { logger } from "../../utils/logger.js";
import { PrinterPollService } from "./printerPollService.js";

export class PollingScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private isStopped = false;

  constructor(
    private readonly pollService: PrinterPollService,
    private readonly settingsRepository: SettingsRepository,
    private readonly historyRepository: HistoryRepository
  ) {}

  start() {
    this.isStopped = false;
    this.scheduleNext(1500);
  }

  stop() {
    this.isStopped = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  refresh() {
    if (this.isStopped || this.isRunning) {
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.scheduleNext(500);
  }

  private scheduleNext(delayMs: number) {
    if (this.isStopped) {
      return;
    }

    this.timer = setTimeout(() => {
      void this.runCycle();
    }, delayMs);
  }

  private async runCycle() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    let nextDelayMs = this.settingsRepository.getSettings().pollIntervalSeconds * 1000;

    try {
      const settings = this.settingsRepository.getSettings();
      nextDelayMs = settings.pollIntervalSeconds * 1000;
      await this.pollService.pollActivePrinters();
      const cleanedRows = this.historyRepository.cleanupOlderThan(settings.historyRetentionDays);

      if (cleanedRows > 0) {
        logger.info(`Deleted ${cleanedRows} expired history rows.`);
      }
    } catch (error) {
      logger.error(
        "Scheduled polling cycle failed.",
        error instanceof Error ? error.message : error
      );
    } finally {
      this.isRunning = false;
      this.scheduleNext(nextDelayMs);
    }
  }
}
