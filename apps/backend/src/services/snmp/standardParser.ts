import type { PollResult, PrinterSummary, TonerLevel, TrayStatus } from "@tisk/shared";

import { SNMP_OIDS } from "./oids.js";
import type { ParsedPrinterData, RawSnmpSnapshot, SnmpPrimitive } from "./profiles/base.js";
import { applyProfileNormalization } from "./profiles/registry.js";

const tonerOrder: Record<TonerLevel["color"], number> = {
  cyan: 0,
  magenta: 1,
  yellow: 2,
  black: 3,
  waste: 4,
  other: 5
};

function asText(value: SnmpPrimitive | undefined): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

function asNumber(value: SnmpPrimitive | undefined): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeSupplyValue(value: SnmpPrimitive | undefined): number | null {
  const parsed = asNumber(value);
  if (parsed === null || parsed <= -2) {
    return null;
  }

  return parsed;
}

function clampPercent(current: number | null, max: number | null): number | null {
  if (current === null || max === null || max <= 0 || current < 0) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round((current / max) * 100)));
}

function detectTonerColor(name: string): TonerLevel["color"] {
  const normalized = name.toLowerCase();

  if (normalized.includes("waste") || normalized.includes("used toner")) {
    return "waste";
  }

  if (normalized.includes("cyan") || normalized.includes("(c)")) {
    return "cyan";
  }

  if (normalized.includes("magenta") || normalized.includes("(m)")) {
    return "magenta";
  }

  if (normalized.includes("yellow") || normalized.includes("(y)")) {
    return "yellow";
  }

  if (normalized.includes("black") || normalized.includes("(k)")) {
    return "black";
  }

  return "other";
}

function isRelevantSupply(name: string, color: TonerLevel["color"]): boolean {
  if (color !== "other") {
    return true;
  }

  return name.toLowerCase().includes("toner");
}

function deriveLevelState(
  percent: number | null,
  current: number | null,
  warningThreshold: number
): TonerLevel["state"] {
  if (percent === null || current === null) {
    return "unknown";
  }

  if (current <= 0 || percent === 0) {
    return "empty";
  }

  if (percent <= warningThreshold) {
    return "low";
  }

  return "ok";
}

function deriveTrayState(percent: number | null, current: number | null): TrayStatus["state"] {
  if (percent === null || current === null) {
    return "unknown";
  }

  if (current <= 0 || percent === 0) {
    return "empty";
  }

  if (percent <= 20) {
    return "low";
  }

  return "ok";
}

function compareRowKeys(left: string, right: string): number {
  const leftParts = left.split(".").map((part) => Number(part));
  const rightParts = right.split(".").map((part) => Number(part));
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;

    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return 0;
}

function parseToners(raw: RawSnmpSnapshot, warningThreshold: number): TonerLevel[] {
  const names = raw.tables[SNMP_OIDS.tonerNamesBase] ?? {};
  const maxValues = raw.tables[SNMP_OIDS.tonerMaxBase] ?? {};
  const currentValues = raw.tables[SNMP_OIDS.tonerCurrentBase] ?? {};
  const keys = Array.from(
    new Set([...Object.keys(names), ...Object.keys(maxValues), ...Object.keys(currentValues)])
  ).sort(compareRowKeys);

  return keys
    .map((key) => {
      const name = asText(names[key]) ?? `Supply ${key}`;
      const color = detectTonerColor(name);
      if (!isRelevantSupply(name, color)) {
        return null;
      }

      const max = normalizeSupplyValue(maxValues[key]);
      const current = normalizeSupplyValue(currentValues[key]);
      const percent = clampPercent(current, max);

      return {
        key,
        name,
        color,
        current,
        max,
        percent,
        state: deriveLevelState(percent, current, warningThreshold)
      } satisfies TonerLevel;
    })
    .filter((value): value is TonerLevel => value !== null)
    .sort(
      (left, right) => (tonerOrder[left.color] ?? 99) - (tonerOrder[right.color] ?? 99)
    );
}

function parseTrays(raw: RawSnmpSnapshot): TrayStatus[] {
  const names = raw.tables[SNMP_OIDS.trayNamesBase] ?? {};
  const capacities = raw.tables[SNMP_OIDS.trayCapacityBase] ?? {};
  const currentValues = raw.tables[SNMP_OIDS.trayCurrentBase] ?? {};
  const keys = Array.from(
    new Set([...Object.keys(names), ...Object.keys(capacities), ...Object.keys(currentValues)])
  ).sort(compareRowKeys);

  return keys.map((key) => {
    const name = asText(names[key]) ?? `Tray ${key}`;
    const capacity = normalizeSupplyValue(capacities[key]);
    const current = normalizeSupplyValue(currentValues[key]);
    const percent = clampPercent(current, capacity);

    return {
      key,
      name,
      capacity,
      current,
      percent,
      state: deriveTrayState(percent, current)
    } satisfies TrayStatus;
  });
}

function firstNumericTableValue(raw: RawSnmpSnapshot, oid: string): number | null {
  const table = raw.tables[oid] ?? {};

  for (const key of Object.keys(table).sort(compareRowKeys)) {
    const parsed = asNumber(table[key]);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

function describeHostResourcesStatus(status: number | null): string | null {
  switch (status) {
    case 3:
      return "Idle";
    case 4:
      return "Printing";
    case 5:
      return "Warmup";
    case 1:
      return "Other";
    case 2:
      return "Unknown";
    default:
      return null;
  }
}

function parseAlerts(raw: RawSnmpSnapshot) {
  const severities = raw.tables[SNMP_OIDS.alertSeverityBase] ?? {};
  const descriptions = raw.tables[SNMP_OIDS.alertDescriptionBase] ?? {};

  let hasError = false;
  let hasWarning = false;
  const messages: string[] = [];

  for (const key of Object.keys(severities).sort(compareRowKeys)) {
    const severity = asNumber(severities[key]);
    const description = asText(descriptions[key]);

    if (severity === 3) {
      hasError = true;
    }

    if (severity === 4 || severity === 5) {
      hasWarning = true;
    }

    if (description) {
      messages.push(description);
    }
  }

  return {
    hasError,
    hasWarning,
    summary: messages.slice(0, 3).join("; ") || null
  };
}

function buildAvailability(
  statusCode: number | null,
  alerts: ReturnType<typeof parseAlerts>,
  toners: TonerLevel[],
  trays: TrayStatus[]
): ParsedPrinterData["availability"] {
  if (alerts.hasError) {
    return "error";
  }

  if (
    alerts.hasWarning ||
    toners.some((toner) => toner.state === "low" || toner.state === "empty") ||
    trays.some((tray) => tray.state === "low" || tray.state === "empty")
  ) {
    return "warning";
  }

  if (statusCode === 3) {
    return "idle";
  }

  if (statusCode === 4 || statusCode === 5) {
    return "ready";
  }

  if (statusCode === 1 || statusCode === 2) {
    return "warning";
  }

  return "unknown";
}

export function parseRawSnapshotToPollResult(params: {
  rawSnapshot: RawSnmpSnapshot;
  printer: PrinterSummary;
  checkedAt: string;
  warningThreshold: number;
}): PollResult {
  const { rawSnapshot, printer, checkedAt, warningThreshold } = params;
  const model = asText(rawSnapshot.scalars[SNMP_OIDS.sysDescr]) ?? printer.model ?? null;
  const statusCode =
    asNumber(rawSnapshot.scalars[SNMP_OIDS.hrPrinterStatus]) ??
    firstNumericTableValue(rawSnapshot, SNMP_OIDS.generalPrinterStatusBase);
  const pageCounter = asNumber(rawSnapshot.scalars[SNMP_OIDS.pageCounter]);
  const toners = parseToners(rawSnapshot, warningThreshold);
  const trays = parseTrays(rawSnapshot);
  const alerts = parseAlerts(rawSnapshot);
  const baseStatusLabel = describeHostResourcesStatus(statusCode);
  const availability = buildAvailability(statusCode, alerts, toners, trays);

  const parsed: ParsedPrinterData = {
    model,
    pageCounter,
    deviceStatus: alerts.summary
      ? `${baseStatusLabel ?? "Status"} (${alerts.summary})`
      : baseStatusLabel ?? "Unknown",
    availability,
    toners,
    trays,
    rawSnapshot: rawSnapshot as unknown as Record<string, unknown>,
    errorMessage: null
  };

  const normalized = applyProfileNormalization(printer, parsed);

  return {
    printerId: printer.id,
    checkedAt,
    isOnline: true,
    availability: normalized.availability,
    deviceStatus: normalized.deviceStatus,
    pageCounter: normalized.pageCounter,
    model: normalized.model,
    toners: normalized.toners,
    trays: normalized.trays,
    rawSnapshot: normalized.rawSnapshot,
    errorMessage: normalized.errorMessage
  };
}
