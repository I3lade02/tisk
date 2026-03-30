export type AvailabilityState =
  | "ready"
  | "idle"
  | "warning"
  | "error"
  | "offline"
  | "unknown";

export type TonerColor =
  | "cyan"
  | "magenta"
  | "yellow"
  | "black"
  | "waste"
  | "other";

export type LevelState = "ok" | "low" | "empty" | "unknown";

export interface TonerLevel {
  key: string;
  name: string;
  color: TonerColor;
  current: number | null;
  max: number | null;
  percent: number | null;
  state: LevelState;
}

export interface TrayStatus {
  key: string;
  name: string;
  capacity: number | null;
  current: number | null;
  percent: number | null;
  state: LevelState;
}

export interface PrinterBase {
  id: string;
  name: string;
  ipAddress: string;
  location: string | null;
  department: string | null;
  notes: string | null;
  model: string | null;
  snmpCommunity: string;
  profileId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrinterSnapshotSummary {
  lastPolledAt: string | null;
  lastSuccessfulAt: string | null;
  lastSeenModel: string | null;
  lastOnline: boolean | null;
  lastDeviceStatus: string | null;
  lastAvailability: AvailabilityState | null;
  lastPageCounter: number | null;
  lastErrorMessage: string | null;
  latestToners: TonerLevel[];
  latestTrays: TrayStatus[];
}

export interface PrinterSummary extends PrinterBase, PrinterSnapshotSummary {}

export interface PrinterStatusHistoryEntry {
  id: string;
  printerId: string;
  checkedAt: string;
  isOnline: boolean;
  availability: AvailabilityState;
  deviceStatus: string | null;
  pageCounter: number | null;
  model: string | null;
  errorMessage: string | null;
  toners: TonerLevel[];
  trays: TrayStatus[];
  rawSnapshot?: Record<string, unknown> | null;
}

export interface PrinterDetail extends PrinterSummary {
  history: PrinterStatusHistoryEntry[];
  rawSnapshot?: Record<string, unknown> | null;
}

export interface AppSettings {
  pollIntervalSeconds: number;
  tonerWarningThreshold: number;
  historyRetentionDays: number | null;
  updatedAt: string;
}

export interface DashboardSummary {
  total: number;
  active: number;
  online: number;
  offline: number;
  warnings: number;
  errors: number;
  lowToner: number;
  lastCheckAt: string | null;
}

export interface PollResult {
  printerId: string;
  checkedAt: string;
  isOnline: boolean;
  availability: AvailabilityState;
  deviceStatus: string | null;
  pageCounter: number | null;
  model: string | null;
  toners: TonerLevel[];
  trays: TrayStatus[];
  rawSnapshot?: Record<string, unknown>;
  errorMessage: string | null;
}

export interface PrinterFormData {
  name: string;
  ipAddress: string;
  location?: string | null;
  department?: string | null;
  notes?: string | null;
  model?: string | null;
  snmpCommunity: string;
  profileId?: string | null;
  isActive?: boolean;
}

export interface SettingsFormData {
  pollIntervalSeconds: number;
  tonerWarningThreshold: number;
  historyRetentionDays?: number | null;
}
