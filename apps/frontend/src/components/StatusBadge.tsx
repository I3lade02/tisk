import type { AvailabilityState } from "@tisk/shared";

import { availabilityLabel } from "../lib/constants";

const stateClassMap: Record<AvailabilityState, string> = {
  ready: "bg-success/10 text-success ring-success/15",
  idle: "bg-accent/10 text-accent ring-accent/15",
  warning: "bg-amber-100 text-amber-800 ring-amber-200",
  error: "bg-danger/10 text-danger ring-danger/15",
  offline: "bg-rose-100 text-rose-700 ring-rose-200",
  unknown: "bg-slate-100 text-slate-600 ring-slate-200"
};

interface StatusBadgeProps {
  state: AvailabilityState | null;
}

export function StatusBadge({ state }: StatusBadgeProps) {
  const normalized = state ?? "unknown";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ring-1 ${stateClassMap[normalized]}`}
    >
      {availabilityLabel[normalized]}
    </span>
  );
}
