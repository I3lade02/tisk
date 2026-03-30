import { useEffect, useMemo, useState, useDeferredValue } from "react";
import type { PrinterFormData, PrinterSummary } from "@tisk/shared";

import {
  createPrinter,
  fetchPrinters,
  fetchSettings,
  fetchSummary,
  pollPrinter,
  updatePrinter,
  updateSettings,
  type PrinterListResponse
} from "../api/printers";
import { EmptyState } from "../components/EmptyState";
import { SummaryStrip } from "../features/dashboard/SummaryStrip";
import {
  PrinterFilters,
  type StatusFilter
} from "../features/printers/PrinterFilters";
import { PrinterFormModal } from "../features/printers/PrinterFormModal";
import { PrinterCard } from "../features/printers/PrinterCard";
import { SettingsModal } from "../features/printers/SettingsModal";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

export function DashboardPage() {
  const [listResponse, setListResponse] = useState<PrinterListResponse | null>(null);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchSummary>> | null>(null);
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof fetchSettings>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterSummary | null>(null);
  const [busyPrinterId, setBusyPrinterId] = useState<string | null>(null);

  async function loadData(isInitial = false) {
    if (isInitial) {
      setLoading(true);
    }

    try {
      const [printers, summaryData, settingsData] = await Promise.all([
        fetchPrinters(),
        fetchSummary(),
        fetchSettings()
      ]);

      setListResponse(printers);
      setSummary(summaryData);
      setSettings(settingsData);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nepodařilo se načíst dashboard.");
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadData(true);
  }, []);

  useAutoRefresh(() => loadData(false), 30000);

  const locations = useMemo(() => {
    const values = new Set<string>();

    for (const printer of listResponse?.items ?? []) {
      if (printer.location) {
        values.add(printer.location);
      }
    }

    return Array.from(values).sort((left, right) => left.localeCompare(right, "cs"));
  }, [listResponse]);

  const filteredPrinters = (listResponse?.items ?? []).filter((printer) => {
    const haystack = `${printer.name} ${printer.ipAddress} ${printer.model ?? ""} ${
      printer.lastSeenModel ?? ""
    }`.toLowerCase();
    const matchesSearch = haystack.includes(deferredSearch.trim().toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "online" && printer.lastOnline === true) ||
      (statusFilter === "offline" && printer.lastOnline === false) ||
      (statusFilter === "warning" && printer.lastAvailability === "warning") ||
      (statusFilter === "error" &&
        (printer.lastAvailability === "error" || printer.lastAvailability === "offline"));
    const matchesLocation = !locationFilter || printer.location === locationFilter;
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && printer.isActive) ||
      (activeFilter === "inactive" && !printer.isActive);

    return matchesSearch && matchesStatus && matchesLocation && matchesActive;
  });

  async function handleSavePrinter(payload: PrinterFormData) {
    if (editingPrinter) {
      await updatePrinter(editingPrinter.id, payload);
    } else {
      await createPrinter(payload);
    }

    setEditingPrinter(null);
    await loadData(false);
  }

  async function handlePoll(printer: PrinterSummary) {
    setBusyPrinterId(printer.id);

    try {
      await pollPrinter(printer.id);
      await loadData(false);
    } finally {
      setBusyPrinterId(null);
    }
  }

  if (loading) {
    return <div className="panel p-8 text-sm text-slate-600">Načítám dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
            Přehled tiskáren
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Monitoring přes SNMP, historie stavů, tonerů a základní administrace z jednoho místa.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="button-secondary" onClick={() => void loadData(false)}>
            Obnovit
          </button>
          <button type="button" className="button-secondary" onClick={() => setShowSettingsModal(true)}>
            Nastavení
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={() => {
              setEditingPrinter(null);
              setShowPrinterModal(true);
            }}
          >
            Přidat tiskárnu
          </button>
        </div>
      </div>

      <SummaryStrip summary={summary} />

      <PrinterFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        activeFilter={activeFilter}
        onActiveFilterChange={setActiveFilter}
        locations={locations}
      />

      {error ? <div className="text-sm text-danger">{error}</div> : null}

      {filteredPrinters.length === 0 ? (
        <EmptyState
          title="Žádné tiskárny neodpovídají filtru"
          description="Změň filtraci nebo přidejte první tiskárnu do evidence."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredPrinters.map((printer) => (
            <PrinterCard
              key={printer.id}
              printer={printer}
              isBusy={busyPrinterId === printer.id}
              onEdit={(selectedPrinter) => {
                setEditingPrinter(selectedPrinter);
                setShowPrinterModal(true);
              }}
              onPoll={(selectedPrinter) => void handlePoll(selectedPrinter)}
            />
          ))}
        </div>
      )}

      <PrinterFormModal
        open={showPrinterModal}
        mode={editingPrinter ? "edit" : "create"}
        printer={editingPrinter}
        profiles={listResponse?.profiles ?? []}
        onClose={() => {
          setShowPrinterModal(false);
          setEditingPrinter(null);
        }}
        onSubmit={handleSavePrinter}
      />

      <SettingsModal
        open={showSettingsModal}
        settings={settings}
        onClose={() => setShowSettingsModal(false)}
        onSubmit={async (payload) => {
          await updateSettings(payload);
          await loadData(false);
        }}
      />
    </div>
  );
}
