import type { PollResult, PrinterFormInput, PrinterSummary } from "@tisk/shared";

import { HttpError } from "../../utils/httpError.js";
import { createId } from "../../utils/ids.js";
import { safeJsonParse, safeJsonStringify } from "../../utils/json.js";
import { nowIso } from "../../utils/time.js";
import { db } from "../connection.js";

type PrinterRow = {
  id: string;
  name: string;
  ip_address: string;
  location: string | null;
  department: string | null;
  notes: string | null;
  model: string | null;
  snmp_community: string;
  profile_id: string | null;
  is_active: number;
  last_polled_at: string | null;
  last_successful_at: string | null;
  last_seen_model: string | null;
  last_online: number | null;
  last_device_status: string | null;
  last_availability: PrinterSummary["lastAvailability"];
  last_page_counter: number | null;
  last_error_message: string | null;
  last_snapshot_json: string | null;
  created_at: string;
  updated_at: string;
};

const selectBaseSql = `
  SELECT
    id,
    name,
    ip_address,
    location,
    department,
    notes,
    model,
    snmp_community,
    profile_id,
    is_active,
    last_polled_at,
    last_successful_at,
    last_seen_model,
    last_online,
    last_device_status,
    last_availability,
    last_page_counter,
    last_error_message,
    last_snapshot_json,
    created_at,
    updated_at
  FROM printers
`;

let selectAllStatement: ReturnType<typeof db.prepare> | null = null;
let selectActiveStatement: ReturnType<typeof db.prepare> | null = null;
let selectByIdStatement: ReturnType<typeof db.prepare> | null = null;
let selectByIpStatement: ReturnType<typeof db.prepare> | null = null;
let deleteStatement: ReturnType<typeof db.prepare> | null = null;
let insertStatement: ReturnType<typeof db.prepare> | null = null;
let updateStatement: ReturnType<typeof db.prepare> | null = null;
let updatePollStateStatement: ReturnType<typeof db.prepare> | null = null;

function getSelectAllStatement() {
  selectAllStatement ??= db.prepare(`${selectBaseSql} ORDER BY name COLLATE NOCASE ASC`);
  return selectAllStatement;
}

function getSelectActiveStatement() {
  selectActiveStatement ??= db.prepare(
    `${selectBaseSql} WHERE is_active = 1 ORDER BY name COLLATE NOCASE ASC`
  );
  return selectActiveStatement;
}

function getSelectByIdStatement() {
  selectByIdStatement ??= db.prepare(`${selectBaseSql} WHERE id = ?`);
  return selectByIdStatement;
}

function getSelectByIpStatement() {
  selectByIpStatement ??= db.prepare(`${selectBaseSql} WHERE ip_address = ?`);
  return selectByIpStatement;
}

function getDeleteStatement() {
  deleteStatement ??= db.prepare(`DELETE FROM printers WHERE id = ?`);
  return deleteStatement;
}

function getInsertStatement() {
  insertStatement ??= db.prepare(`
    INSERT INTO printers (
      id,
      name,
      ip_address,
      location,
      department,
      notes,
      model,
      snmp_community,
      profile_id,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @name,
      @ipAddress,
      @location,
      @department,
      @notes,
      @model,
      @snmpCommunity,
      @profileId,
      @isActive,
      @createdAt,
      @updatedAt
    )
  `);

  return insertStatement;
}

function getUpdateStatement() {
  updateStatement ??= db.prepare(`
    UPDATE printers SET
      name = @name,
      ip_address = @ipAddress,
      location = @location,
      department = @department,
      notes = @notes,
      model = @model,
      snmp_community = @snmpCommunity,
      profile_id = @profileId,
      is_active = @isActive,
      updated_at = @updatedAt
    WHERE id = @id
  `);

  return updateStatement;
}

function getUpdatePollStateStatement() {
  updatePollStateStatement ??= db.prepare(`
    UPDATE printers SET
      last_polled_at = @checkedAt,
      last_successful_at = CASE WHEN @isOnline = 1 THEN @checkedAt ELSE last_successful_at END,
      last_seen_model = COALESCE(@model, last_seen_model),
      last_online = @isOnline,
      last_device_status = @deviceStatus,
      last_availability = @availability,
      last_page_counter = COALESCE(@pageCounter, last_page_counter),
      last_error_message = @errorMessage,
      last_snapshot_json = @snapshot,
      model = COALESCE(model, @model),
      updated_at = @updatedAt
    WHERE id = @id
  `);

  return updatePollStateStatement;
}

function mapRow(row: PrinterRow): PrinterSummary {
  const snapshot = safeJsonParse<PollResult>(row.last_snapshot_json);

  return {
    id: row.id,
    name: row.name,
    ipAddress: row.ip_address,
    location: row.location,
    department: row.department,
    notes: row.notes,
    model: row.model,
    snmpCommunity: row.snmp_community,
    profileId: row.profile_id,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastPolledAt: row.last_polled_at,
    lastSuccessfulAt: row.last_successful_at,
    lastSeenModel: row.last_seen_model,
    lastOnline: row.last_online === null ? null : row.last_online === 1,
    lastDeviceStatus: row.last_device_status,
    lastAvailability: row.last_availability,
    lastPageCounter: row.last_page_counter,
    lastErrorMessage: row.last_error_message,
    latestToners: snapshot?.toners ?? [],
    latestTrays: snapshot?.trays ?? []
  };
}

function mapSqliteError(error: unknown): never {
  if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
    throw new HttpError(409, "Tiskárna s touto IP adresou už existuje.");
  }

  throw error;
}

export class PrinterRepository {
  listAll(): PrinterSummary[] {
    return (getSelectAllStatement().all() as PrinterRow[]).map(mapRow);
  }

  listActive(): PrinterSummary[] {
    return (getSelectActiveStatement().all() as PrinterRow[]).map(mapRow);
  }

  getById(id: string): PrinterSummary | null {
    const row = getSelectByIdStatement().get(id) as PrinterRow | undefined;
    return row ? mapRow(row) : null;
  }

  findByIpAddress(ipAddress: string): PrinterSummary | null {
    const row = getSelectByIpStatement().get(ipAddress) as PrinterRow | undefined;
    return row ? mapRow(row) : null;
  }

  getLastSnapshot(id: string): PollResult | null {
    const row = getSelectByIdStatement().get(id) as PrinterRow | undefined;
    return row ? safeJsonParse<PollResult>(row.last_snapshot_json) : null;
  }

  create(input: PrinterFormInput): PrinterSummary {
    const timestamp = nowIso();
    const id = createId();

    try {
      getInsertStatement().run({
        id,
        name: input.name,
        ipAddress: input.ipAddress,
        location: input.location ?? null,
        department: input.department ?? null,
        notes: input.notes ?? null,
        model: input.model ?? null,
        snmpCommunity: input.snmpCommunity,
        profileId: input.profileId ?? null,
        isActive: input.isActive ?? true ? 1 : 0,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    } catch (error) {
      mapSqliteError(error);
    }

    const created = this.getById(id);
    if (!created) {
      throw new HttpError(500, "Tiskárnu se nepodařilo vytvořit.");
    }

    return created;
  }

  update(id: string, input: PrinterFormInput): PrinterSummary {
    const updatedAt = nowIso();

    try {
      const result = getUpdateStatement().run({
        id,
        name: input.name,
        ipAddress: input.ipAddress,
        location: input.location ?? null,
        department: input.department ?? null,
        notes: input.notes ?? null,
        model: input.model ?? null,
        snmpCommunity: input.snmpCommunity,
        profileId: input.profileId ?? null,
        isActive: input.isActive ?? true ? 1 : 0,
        updatedAt
      });

      if (result.changes === 0) {
        throw new HttpError(404, "Tiskárna nebyla nalezena.");
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      mapSqliteError(error);
    }

    const updated = this.getById(id);
    if (!updated) {
      throw new HttpError(500, "Tiskárnu se nepodařilo načíst po úpravě.");
    }

    return updated;
  }

  delete(id: string): void {
    const result = getDeleteStatement().run(id);
    if (result.changes === 0) {
      throw new HttpError(404, "Tiskárna nebyla nalezena.");
    }
  }

  updateWithPollResult(id: string, result: PollResult): void {
    const updatedAt = nowIso();

    getUpdatePollStateStatement().run({
      id,
      checkedAt: result.checkedAt,
      isOnline: result.isOnline ? 1 : 0,
      model: result.model,
      deviceStatus: result.deviceStatus,
      availability: result.availability,
      pageCounter: result.pageCounter,
      errorMessage: result.errorMessage,
      snapshot: safeJsonStringify(result),
      updatedAt
    });
  }
}
