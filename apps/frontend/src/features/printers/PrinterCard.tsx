import type { PrinterSummary } from "@tisk/shared";
import { Link } from "react-router-dom";

import { StatusBadge } from "../../components/StatusBadge";
import { TonerBar } from "../../components/TonerBar";
import { formatDateTime, formatNumber } from "../../lib/format";

interface PrinterCardProps {
  printer: PrinterSummary;
  isBusy: boolean;
  onEdit: (printer: PrinterSummary) => void;
  onPoll: (printer: PrinterSummary) => void;
}

export function PrinterCard({ printer, isBusy, onEdit, onPoll }: PrinterCardProps) {
  const model = printer.lastSeenModel ?? printer.model ?? "Unknown model";
  const tonerPreview = printer.latestToners.slice(0, 4);

  return (
    <article className="panel bg-lattice p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link to={`/printers/${printer.id}`} className="text-xl font-semibold text-ink hover:text-accent">
              {printer.name}
            </Link>
            <StatusBadge state={printer.lastAvailability} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
            <span>{printer.ipAddress}</span>
            <span className="text-line">•</span>
            <span>{model}</span>
            {printer.location ? (
              <>
                <span className="text-line">•</span>
                <span>{printer.location}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="button" className="button-secondary px-3 py-2" onClick={() => onEdit(printer)}>
            Upravit
          </button>
          <button
            type="button"
            className="button-primary px-3 py-2"
            onClick={() => onPoll(printer)}
            disabled={isBusy}
          >
            {isBusy ? "Polluji..." : "Poll"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line/80 bg-white/85 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Page counter
          </div>
          <div className="mt-2 text-2xl font-semibold text-ink">
            {formatNumber(printer.lastPageCounter)}
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Poslední aktualizace: {formatDateTime(printer.lastPolledAt)}
          </div>
        </div>

        <div className="rounded-2xl border border-line/80 bg-white/85 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Stav zařízení
          </div>
          <div className="mt-2 text-lg font-semibold text-ink">
            {printer.lastDeviceStatus ?? "Unknown"}
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Poslední úspěšný kontakt: {formatDateTime(printer.lastSuccessfulAt)}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {tonerPreview.length > 0 ? (
          tonerPreview.map((toner) => <TonerBar key={toner.key} toner={toner} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white/70 p-4 text-sm text-slate-500">
            Toner data zatím nejsou dostupná.
          </div>
        )}
      </div>
    </article>
  );
}
