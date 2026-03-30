import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { PrinterFormData } from "@tisk/shared";

import {
  deletePrinter,
  fetchPrinter,
  fetchPrinters,
  pollPrinter,
  updatePrinter
} from "../api/printers";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { TonerBar } from "../components/TonerBar";
import { TrayGrid } from "../components/TrayGrid";
import { PrinterFormModal } from "../features/printers/PrinterFormModal";
import { PrinterHistoryTable } from "../features/printers/PrinterHistoryTable";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { formatDateTime, formatNumber } from "../lib/format";

export function PrinterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [printer, setPrinter] = useState<Awaited<ReturnType<typeof fetchPrinter>> | null>(null);
  const [profiles, setProfiles] = useState<Awaited<ReturnType<typeof fetchPrinters>>["profiles"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadData(isInitial = false) {
    if (!id) {
      setError("Chybí ID tiskárny.");
      setLoading(false);
      return;
    }

    if (isInitial) {
      setLoading(true);
    }

    try {
      const [detail, printerList] = await Promise.all([fetchPrinter(id), fetchPrinters()]);
      setPrinter(detail);
      setProfiles(printerList.profiles);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Tiskárnu se nepodařilo načíst.");
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadData(true);
  }, [id]);

  useAutoRefresh(() => loadData(false), 30000);

  if (loading) {
    return <div className="panel p-8 text-sm text-slate-600">Načítám detail tiskárny...</div>;
  }

  if (!printer) {
    return (
      <EmptyState
        title="Tiskárna nebyla nalezena"
        description={error ?? "Záznam neexistuje nebo ho nebylo možné načíst."}
      />
    );
  }

  const currentPrinter = printer;

  async function handleSave(payload: PrinterFormData) {
    await updatePrinter(currentPrinter.id, payload);
    await loadData(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link to="/" className="text-sm font-semibold text-accent hover:text-accent/80">
            ← Zpět na dashboard
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
              {printer.name}
            </h1>
            <StatusBadge state={printer.lastAvailability} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
            <span>{printer.ipAddress}</span>
            <span className="text-line">•</span>
            <span>{printer.lastSeenModel ?? printer.model ?? "Unknown model"}</span>
            {printer.location ? (
              <>
                <span className="text-line">•</span>
                <span>{printer.location}</span>
              </>
            ) : null}
            {printer.department ? (
              <>
                <span className="text-line">•</span>
                <span>{printer.department}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="button-secondary" onClick={() => void loadData(false)}>
            Obnovit
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={async () => {
              setIsPolling(true);
              try {
                await pollPrinter(currentPrinter.id);
                await loadData(false);
              } finally {
                setIsPolling(false);
              }
            }}
            disabled={isPolling}
          >
            {isPolling ? "Polluji..." : "Spustit poll"}
          </button>
          <button type="button" className="button-secondary" onClick={() => setShowEditModal(true)}>
            Upravit
          </button>
          <button
            type="button"
            className="button-danger"
            onClick={async () => {
              if (!window.confirm(`Opravdu smazat tiskárnu ${currentPrinter.name}?`)) {
                return;
              }

              setIsDeleting(true);
              try {
                await deletePrinter(currentPrinter.id);
                navigate("/");
              } finally {
                setIsDeleting(false);
              }
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Mažu..." : "Smazat"}
          </button>
        </div>
      </div>

      {error ? <div className="text-sm text-danger">{error}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="panel p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line/80 bg-white/90 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Stav zařízení
              </div>
              <div className="mt-2 text-xl font-semibold text-ink">
                {printer.lastDeviceStatus ?? "Unknown"}
              </div>
            </div>

            <div className="rounded-2xl border border-line/80 bg-white/90 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Page counter
              </div>
              <div className="mt-2 text-xl font-semibold text-ink">
                {formatNumber(printer.lastPageCounter)}
              </div>
            </div>

            <div className="rounded-2xl border border-line/80 bg-white/90 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Poslední poll
              </div>
              <div className="mt-2 text-sm font-medium text-ink">
                {formatDateTime(printer.lastPolledAt)}
              </div>
            </div>

            <div className="rounded-2xl border border-line/80 bg-white/90 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Poslední úspěšný kontakt
              </div>
              <div className="mt-2 text-sm font-medium text-ink">
                {formatDateTime(printer.lastSuccessfulAt)}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Tonery</h2>
              <span className="text-sm text-slate-500">
                {printer.latestToners.length} položek
              </span>
            </div>

            <div className="grid gap-3">
              {printer.latestToners.length > 0 ? (
                printer.latestToners.map((toner) => <TonerBar key={toner.key} toner={toner} />)
              ) : (
                <div className="rounded-2xl border border-dashed border-line bg-white/70 p-4 text-sm text-slate-500">
                  Toner data nejsou dostupná.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Papírové zásobníky</h2>
            <button
              type="button"
              className="button-secondary px-3 py-2"
              onClick={() => setShowRaw((current) => !current)}
            >
              {showRaw ? "Skrýt raw SNMP" : "Zobrazit raw SNMP"}
            </button>
          </div>

          <div className="mt-4">
            <TrayGrid trays={printer.latestTrays} />
          </div>

          {showRaw ? (
            <div className="mt-6 rounded-2xl border border-line bg-slate-950 p-4 text-xs text-slate-100">
              <pre>{JSON.stringify(printer.rawSnapshot ?? {}, null, 2)}</pre>
            </div>
          ) : null}
        </section>
      </div>

      <section className="panel p-6">
        <h2 className="text-lg font-semibold text-ink">Historie</h2>
        <div className="mt-4">
          <PrinterHistoryTable history={printer.history} />
        </div>
      </section>

      <PrinterFormModal
        open={showEditModal}
        mode="edit"
        printer={currentPrinter}
        profiles={profiles}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSave}
      />
    </div>
  );
}
