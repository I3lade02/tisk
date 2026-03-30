import type { ParsedPrinterData, PrinterProfile } from "./base.js";
import type { PrinterSummary } from "@tisk/shared";

import { developIneo250iProfile } from "./developIneo250iProfile.js";

const profiles: PrinterProfile[] = [developIneo250iProfile];

export function resolvePrinterProfile(
  printer: PrinterSummary,
  model: string | null
): PrinterProfile | null {
  return profiles.find((profile) => profile.matches(model, printer)) ?? null;
}

export function applyProfileNormalization(
  printer: PrinterSummary,
  data: ParsedPrinterData
): ParsedPrinterData {
  const profile = resolvePrinterProfile(printer, data.model);
  return profile ? profile.normalize(data) : data;
}

export function listPrinterProfiles(): Array<Pick<PrinterProfile, "id" | "name">> {
  return profiles.map((profile) => ({
    id: profile.id,
    name: profile.name
  }));
}
