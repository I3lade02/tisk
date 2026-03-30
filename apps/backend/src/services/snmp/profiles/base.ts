import type {
  AvailabilityState,
  PrinterSummary,
  TonerLevel,
  TrayStatus
} from "@tisk/shared";

export type SnmpPrimitive = string | number | boolean | null;

export interface RawSnmpSnapshot {
  scalars: Record<string, SnmpPrimitive>;
  tables: Record<string, Record<string, SnmpPrimitive>>;
}

export interface ParsedPrinterData {
  model: string | null;
  pageCounter: number | null;
  deviceStatus: string | null;
  availability: AvailabilityState;
  toners: TonerLevel[];
  trays: TrayStatus[];
  rawSnapshot: Record<string, unknown>;
  errorMessage: string | null;
}

export interface PrinterProfile {
  id: string;
  name: string;
  matches(model: string | null, printer: PrinterSummary): boolean;
  normalize(data: ParsedPrinterData): ParsedPrinterData;
}
