import type {
  PollResult,
  PrinterStatusHistoryEntry,
  TonerLevel,
  TrayStatus
} from "@tisk/shared";

import { createId } from "../../utils/ids.js";
import { safeJsonParse, safeJsonStringify } from "../../utils/json.js";
import { daysAgoIso } from "../../utils/time.js";
import { db } from "../connection.js";

type HistoryRow = {
  id: string;
  printer_id: string;
  checked_at: string;
  is_online: number;
  availability: PrinterStatusHistoryEntry["availability"];
  device_status: string | null;
  page_counter: number | null;
  model: string | null;
  error_message: string | null;
  raw_snapshot_json: string | null;
};

type TonerRow = {
  history_id: string;
  toner_key: string;
  name: string;
  color: TonerLevel["color"];
  current_value: number | null;
  max_value: number | null;
  percent: number | null;
  state: TonerLevel["state"];
};

type TrayRow = {
  history_id: string;
  tray_key: string;
  name: string;
  capacity: number | null;
  current_value: number | null;
  percent: number | null;
  state: TrayStatus["state"];
};

let insertHistoryStatement: ReturnType<typeof db.prepare> | null = null;
let insertTonerStatement: ReturnType<typeof db.prepare> | null = null;
let insertTrayStatement: ReturnType<typeof db.prepare> | null = null;
let selectHistoryStatement: ReturnType<typeof db.prepare> | null = null;
let selectTonersByHistoryStatement: ReturnType<typeof db.prepare> | null = null;
let selectTraysByHistoryStatement: ReturnType<typeof db.prepare> | null = null;
let deleteOldTonerHistoryStatement: ReturnType<typeof db.prepare> | null = null;
let deleteOldTrayHistoryStatement: ReturnType<typeof db.prepare> | null = null;
let deleteOldStatusHistoryStatement: ReturnType<typeof db.prepare> | null = null;
let insertSnapshotTransaction: ((printerId: string, result: PollResult) => void) | null = null;

function getInsertHistoryStatement() {
  insertHistoryStatement ??= db.prepare(`
    INSERT INTO printer_status_history (
      id,
      printer_id,
      checked_at,
      is_online,
      availability,
      device_status,
      page_counter,
      model,
      error_message,
      raw_snapshot_json
    ) VALUES (
      @id,
      @printerId,
      @checkedAt,
      @isOnline,
      @availability,
      @deviceStatus,
      @pageCounter,
      @model,
      @errorMessage,
      @rawSnapshotJson
    )
  `);

  return insertHistoryStatement;
}

function getInsertTonerStatement() {
  insertTonerStatement ??= db.prepare(`
    INSERT INTO toner_levels_history (
      id,
      history_id,
      printer_id,
      checked_at,
      toner_key,
      name,
      color,
      current_value,
      max_value,
      percent,
      state
    ) VALUES (
      @id,
      @historyId,
      @printerId,
      @checkedAt,
      @key,
      @name,
      @color,
      @current,
      @max,
      @percent,
      @state
    )
  `);

  return insertTonerStatement;
}

function getInsertTrayStatement() {
  insertTrayStatement ??= db.prepare(`
    INSERT INTO tray_status_history (
      id,
      history_id,
      printer_id,
      checked_at,
      tray_key,
      name,
      capacity,
      current_value,
      percent,
      state
    ) VALUES (
      @id,
      @historyId,
      @printerId,
      @checkedAt,
      @key,
      @name,
      @capacity,
      @current,
      @percent,
      @state
    )
  `);

  return insertTrayStatement;
}

function getSelectHistoryStatement() {
  selectHistoryStatement ??= db.prepare(`
    SELECT
      id,
      printer_id,
      checked_at,
      is_online,
      availability,
      device_status,
      page_counter,
      model,
      error_message,
      raw_snapshot_json
    FROM printer_status_history
    WHERE printer_id = ?
    ORDER BY checked_at DESC
    LIMIT ?
  `);

  return selectHistoryStatement;
}

function getSelectTonersByHistoryStatement() {
  selectTonersByHistoryStatement ??= db.prepare(`
    SELECT
      history_id,
      toner_key,
      name,
      color,
      current_value,
      max_value,
      percent,
      state
    FROM toner_levels_history
    WHERE history_id = ?
    ORDER BY rowid ASC
  `);

  return selectTonersByHistoryStatement;
}

function getSelectTraysByHistoryStatement() {
  selectTraysByHistoryStatement ??= db.prepare(`
    SELECT
      history_id,
      tray_key,
      name,
      capacity,
      current_value,
      percent,
      state
    FROM tray_status_history
    WHERE history_id = ?
    ORDER BY rowid ASC
  `);

  return selectTraysByHistoryStatement;
}

function getDeleteOldTonerHistoryStatement() {
  deleteOldTonerHistoryStatement ??= db.prepare(`
    DELETE FROM toner_levels_history
    WHERE checked_at < ?
  `);

  return deleteOldTonerHistoryStatement;
}

function getDeleteOldTrayHistoryStatement() {
  deleteOldTrayHistoryStatement ??= db.prepare(`
    DELETE FROM tray_status_history
    WHERE checked_at < ?
  `);

  return deleteOldTrayHistoryStatement;
}

function getDeleteOldStatusHistoryStatement() {
  deleteOldStatusHistoryStatement ??= db.prepare(`
    DELETE FROM printer_status_history
    WHERE checked_at < ?
  `);

  return deleteOldStatusHistoryStatement;
}

function getInsertSnapshotTransaction() {
  insertSnapshotTransaction ??= db.transaction((printerId: string, result: PollResult) => {
    const historyId = createId();

    getInsertHistoryStatement().run({
      id: historyId,
      printerId,
      checkedAt: result.checkedAt,
      isOnline: result.isOnline ? 1 : 0,
      availability: result.availability,
      deviceStatus: result.deviceStatus,
      pageCounter: result.pageCounter,
      model: result.model,
      errorMessage: result.errorMessage,
      rawSnapshotJson: result.rawSnapshot ? safeJsonStringify(result.rawSnapshot) : null
    });

    for (const toner of result.toners) {
      getInsertTonerStatement().run({
        id: createId(),
        historyId,
        printerId,
        checkedAt: result.checkedAt,
        key: toner.key,
        name: toner.name,
        color: toner.color,
        current: toner.current,
        max: toner.max,
        percent: toner.percent,
        state: toner.state
      });
    }

    for (const tray of result.trays) {
      getInsertTrayStatement().run({
        id: createId(),
        historyId,
        printerId,
        checkedAt: result.checkedAt,
        key: tray.key,
        name: tray.name,
        capacity: tray.capacity,
        current: tray.current,
        percent: tray.percent,
        state: tray.state
      });
    }
  });

  return insertSnapshotTransaction;
}

export class HistoryRepository {
  insert(printerId: string, result: PollResult): void {
    getInsertSnapshotTransaction()(printerId, result);
  }

  listByPrinterId(printerId: string, limit = 30): PrinterStatusHistoryEntry[] {
    const historyRows = getSelectHistoryStatement().all(printerId, limit) as HistoryRow[];

    return historyRows.map((row) => ({
      id: row.id,
      printerId: row.printer_id,
      checkedAt: row.checked_at,
      isOnline: row.is_online === 1,
      availability: row.availability,
      deviceStatus: row.device_status,
      pageCounter: row.page_counter,
      model: row.model,
      errorMessage: row.error_message,
      toners: (getSelectTonersByHistoryStatement().all(row.id) as TonerRow[]).map((toner) => ({
        key: toner.toner_key,
        name: toner.name,
        color: toner.color,
        current: toner.current_value,
        max: toner.max_value,
        percent: toner.percent,
        state: toner.state
      })),
      trays: (getSelectTraysByHistoryStatement().all(row.id) as TrayRow[]).map((tray) => ({
        key: tray.tray_key,
        name: tray.name,
        capacity: tray.capacity,
        current: tray.current_value,
        percent: tray.percent,
        state: tray.state
      })),
      rawSnapshot: safeJsonParse<Record<string, unknown>>(row.raw_snapshot_json)
    }));
  }

  cleanupOlderThan(days: number | null): number {
    if (days === null) {
      return 0;
    }

    const threshold = daysAgoIso(days);
    getDeleteOldTonerHistoryStatement().run(threshold);
    getDeleteOldTrayHistoryStatement().run(threshold);
    const result = getDeleteOldStatusHistoryStatement().run(threshold);
    return result.changes;
  }
}
