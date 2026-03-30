import type { TrayStatus } from "@tisk/shared";

import { formatPercent } from "../lib/format";

interface TrayGridProps {
  trays: TrayStatus[];
}

export function TrayGrid({ trays }: TrayGridProps) {
  if (trays.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white/60 p-5 text-sm text-slate-500">
        Žádná tray data nejsou k dispozici.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {trays.map((tray) => (
        <div key={tray.key} className="rounded-2xl border border-line/80 bg-white/90 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium text-ink">{tray.name}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                {tray.state}
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-700">
              {formatPercent(tray.percent)}
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full ${
                tray.state === "empty"
                  ? "bg-danger"
                  : tray.state === "low"
                    ? "bg-amber-500"
                    : "bg-accent"
              }`}
              style={{ width: `${tray.percent ?? 0}%` }}
            />
          </div>

          <div className="mt-2 text-xs text-slate-500">
            {tray.current ?? "?"} / {tray.capacity ?? "?"}
          </div>
        </div>
      ))}
    </div>
  );
}
