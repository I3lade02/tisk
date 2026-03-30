import type { TonerLevel } from "@tisk/shared";

import { tonerColorClass } from "../lib/constants";
import { formatPercent } from "../lib/format";

interface TonerBarProps {
  toner: TonerLevel;
}

export function TonerBar({ toner }: TonerBarProps) {
  const width = toner.percent ?? 0;
  const isAlert = toner.state === "low" || toner.state === "empty";

  return (
    <div className="rounded-2xl border border-line/80 bg-white/90 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">{toner.name}</span>
        <span className={`text-sm font-semibold ${isAlert ? "text-danger" : "text-slate-600"}`}>
          {formatPercent(toner.percent)}
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${tonerColorClass[toner.color]}`}
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-slate-500">
        {toner.current ?? "?"} / {toner.max ?? "?"}
      </div>
    </div>
  );
}
