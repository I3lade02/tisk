import type { PrinterStatusHistoryEntry } from "@tisk/shared";

import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime, formatNumber } from "../../lib/format";

interface PrinterHistoryTableProps {
  history: PrinterStatusHistoryEntry[];
}

export function PrinterHistoryTable({ history }: PrinterHistoryTableProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-white/60 p-5 text-sm text-slate-500">
        Historie zatím neobsahuje žádné záznamy.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white/90">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Čas</th>
              <th className="px-4 py-3">Dostupnost</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Page counter</th>
              <th className="px-4 py-3">Toner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {history.map((entry) => (
              <tr key={entry.id} className="align-top">
                <td className="px-4 py-3 text-slate-600">{formatDateTime(entry.checkedAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge state={entry.availability} />
                </td>
                <td className="px-4 py-3 text-slate-700">{entry.deviceStatus ?? "Unknown"}</td>
                <td className="px-4 py-3 text-slate-700">
                  {formatNumber(entry.pageCounter)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {entry.toners.length === 0
                    ? "Unknown"
                    : entry.toners.map((toner) => `${toner.name}: ${toner.percent ?? "?"}%`).join(" | ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
