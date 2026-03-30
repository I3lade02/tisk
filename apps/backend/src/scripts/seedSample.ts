import { SettingsRepository } from "../db/repositories/settingsRepository.js";
import { runMigrations } from "../db/migrate.js";
import { PrinterRepository } from "../db/repositories/printerRepository.js";
import { HistoryRepository } from "../db/repositories/historyRepository.js";
import { parseRawSnapshotToPollResult } from "../services/snmp/standardParser.js";
import { createDevelopIneo250iSampleRawSnapshot } from "../services/snmp/sampleData.js";
import { logger } from "../utils/logger.js";

async function main() {
  runMigrations();

  const settingsRepository = new SettingsRepository();
  settingsRepository.ensureDefaults();
  const printerRepository = new PrinterRepository();
  const historyRepository = new HistoryRepository();

  const existing = printerRepository.findByIpAddress("192.168.95.141");

  const printer =
    existing ??
    printerRepository.create({
      name: "Develop ineo+ 250i",
      ipAddress: "192.168.95.141",
      location: "HQ / 2. patro",
      department: "IT",
      notes: "Ukázková testovací tiskárna pro MVP",
      model: "Develop ineo+ 250i",
      snmpCommunity: "public",
      profileId: "develop-ineo-plus-250i",
      isActive: true
    });

  const settings = settingsRepository.getSettings();
  const result = parseRawSnapshotToPollResult({
    rawSnapshot: createDevelopIneo250iSampleRawSnapshot(),
    printer,
    checkedAt: new Date().toISOString(),
    warningThreshold: settings.tonerWarningThreshold
  });

  historyRepository.insert(printer.id, result);
  printerRepository.updateWithPollResult(printer.id, result);

  logger.info(`Sample printer prepared: ${printer.name} (${printer.ipAddress})`);
}

void main();
