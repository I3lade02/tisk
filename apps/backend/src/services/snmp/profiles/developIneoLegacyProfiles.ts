import type { ParsedPrinterData, PrinterProfile } from "./base.js";
import type { TonerLevel, PrinterSummary } from "@tisk/shared";

const canonicalColors: Array<TonerLevel["color"]> = ["cyan", "magenta", "yellow", "black"];

const canonicalNames: Record<TonerLevel["color"], string> = {
  cyan: "Toner (Cyan)",
  magenta: "Toner (Magenta)",
  yellow: "Toner (Yellow)",
  black: "Toner (Black)",
  waste: "Waste toner box",
  other: "Supply"
};

function matchesIneoModel(model: string | null, printer: PrinterSummary, variant: string): boolean {
  const candidate = `${printer.profileId ?? ""} ${printer.model ?? ""} ${model ?? ""}`.toLowerCase();
  return candidate.includes("develop") && candidate.includes(variant);
}

function isImagingUnit(name: string): boolean {
  const normalized = name.toLowerCase();
  return (
    normalized.includes("imaging unit") ||
    normalized.includes("drum") ||
    normalized.includes("developer unit")
  );
}

function normalizeLegacyTonerComposition(data: ParsedPrinterData): ParsedPrinterData {
  const visibleSupplies = data.toners.filter((toner) => !isImagingUnit(toner.name));
  const hasClassicColorCoverage = canonicalColors.every((color) =>
    visibleSupplies.some((toner) => toner.color === color)
  );

  const normalizedToners = hasClassicColorCoverage
    ? canonicalColors
        .map((color) => {
          const selected =
            visibleSupplies.find(
              (toner) => toner.color === color && toner.name.toLowerCase().includes("toner")
            ) ?? visibleSupplies.find((toner) => toner.color === color);

          return selected
            ? {
                ...selected,
                name: canonicalNames[color],
                color
              }
            : null;
        })
        .filter((toner): toner is TonerLevel => toner !== null)
    : data.toners.slice(0, canonicalColors.length).map((toner, index) => {
        const color = canonicalColors[index] ?? toner.color;
        return {
          ...toner,
          color,
          name: canonicalNames[color]
        };
      });

  return {
    ...data,
    toners: normalizedToners
  };
}

export const developIneo227Profile: PrinterProfile = {
  id: "develop-ineo-plus-227",
  name: "Develop ineo+ 227",
  matches: (model, printer) => matchesIneoModel(model, printer, "227"),
  normalize: normalizeLegacyTonerComposition
};

export const developIneo224eProfile: PrinterProfile = {
  id: "develop-ineo-plus-224e",
  name: "Develop ineo+ 224e",
  matches: (model, printer) => matchesIneoModel(model, printer, "224e"),
  normalize: normalizeLegacyTonerComposition
};
