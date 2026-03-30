import type { AvailabilityState, TonerColor } from "@tisk/shared";

export const availabilityLabel: Record<AvailabilityState, string> = {
  ready: "Ready",
  idle: "Idle",
  warning: "Warning",
  error: "Error",
  offline: "Offline",
  unknown: "Unknown"
};

export const tonerColorClass: Record<TonerColor, string> = {
  cyan: "bg-sky-500",
  magenta: "bg-rose-500",
  yellow: "bg-amber-400",
  black: "bg-slate-800",
  waste: "bg-stone-500",
  other: "bg-slate-400"
};
