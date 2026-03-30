import type { ParsedPrinterData, PrinterProfile } from "./base.js";
import type { PrinterSummary } from "@tisk/shared";

const tonerLabelByColor = {
  cyan: "Cyan",
  magenta: "Magenta",
  yellow: "Yellow",
  black: "Black",
  waste: "Waste toner box",
  other: "Supply"
} as const;

function matchesDevelopProfile(model: string | null, printer: PrinterSummary): boolean {
  const candidate = `${printer.profileId ?? ""} ${printer.model ?? ""} ${model ?? ""}`.toLowerCase();
  return (
    candidate.includes("develop") &&
    candidate.includes("250i")
  ) || candidate.includes("develop-ineo-plus-250i");
}

function normalizeTonerNames(data: ParsedPrinterData): ParsedPrinterData {
  return {
    ...data,
    toners: data.toners.map((toner) => ({
      ...toner,
      name: tonerLabelByColor[toner.color] ?? toner.name
    }))
  };
}

export const developIneo250iProfile: PrinterProfile = {
  id: "develop-ineo-plus-250i",
  name: "Develop ineo+ 250i",
  matches: matchesDevelopProfile,
  normalize: normalizeTonerNames
};
