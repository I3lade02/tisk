import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useDeferredValue } from "react";
import { createPrinter, fetchPrinters, fetchSettings, fetchSummary, pollPrinter, updatePrinter, updateSettings } from "../api/printers";
import { EmptyState } from "../components/EmptyState";
import { SummaryStrip } from "../features/dashboard/SummaryStrip";
import { PrinterFilters } from "../features/printers/PrinterFilters";
import { PrinterFormModal } from "../features/printers/PrinterFormModal";
import { PrinterCard } from "../features/printers/PrinterCard";
import { SettingsModal } from "../features/printers/SettingsModal";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
export function DashboardPage() {
    const [listResponse, setListResponse] = useState(null);
    const [summary, setSummary] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [statusFilter, setStatusFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [showPrinterModal, setShowPrinterModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [editingPrinter, setEditingPrinter] = useState(null);
    const [busyPrinterId, setBusyPrinterId] = useState(null);
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
        }
        catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Nepodařilo se načíst dashboard.");
        }
        finally {
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
        const values = new Set();
        for (const printer of listResponse?.items ?? []) {
            if (printer.location) {
                values.add(printer.location);
            }
        }
        return Array.from(values).sort((left, right) => left.localeCompare(right, "cs"));
    }, [listResponse]);
    const filteredPrinters = (listResponse?.items ?? []).filter((printer) => {
        const haystack = `${printer.name} ${printer.ipAddress} ${printer.model ?? ""} ${printer.lastSeenModel ?? ""}`.toLowerCase();
        const matchesSearch = haystack.includes(deferredSearch.trim().toLowerCase());
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "online" && printer.lastOnline === true) ||
            (statusFilter === "offline" && printer.lastOnline === false) ||
            (statusFilter === "warning" && printer.lastAvailability === "warning") ||
            (statusFilter === "error" &&
                (printer.lastAvailability === "error" || printer.lastAvailability === "offline"));
        const matchesLocation = !locationFilter || printer.location === locationFilter;
        const matchesActive = activeFilter === "all" ||
            (activeFilter === "active" && printer.isActive) ||
            (activeFilter === "inactive" && !printer.isActive);
        return matchesSearch && matchesStatus && matchesLocation && matchesActive;
    });
    async function handleSavePrinter(payload) {
        if (editingPrinter) {
            await updatePrinter(editingPrinter.id, payload);
        }
        else {
            await createPrinter(payload);
        }
        setEditingPrinter(null);
        await loadData(false);
    }
    async function handlePoll(printer) {
        setBusyPrinterId(printer.id);
        try {
            await pollPrinter(printer.id);
            await loadData(false);
        }
        finally {
            setBusyPrinterId(null);
        }
    }
    if (loading) {
        return _jsx("div", { className: "panel p-8 text-sm text-slate-600", children: "Na\u010D\u00EDt\u00E1m dashboard..." });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-display text-4xl font-semibold tracking-tight text-ink", children: "P\u0159ehled tisk\u00E1ren" }), _jsx("p", { className: "mt-2 max-w-2xl text-sm text-slate-600", children: "Monitoring p\u0159es SNMP, historie stav\u016F, toner\u016F a z\u00E1kladn\u00ED administrace z jednoho m\u00EDsta." })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx("button", { type: "button", className: "button-secondary", onClick: () => void loadData(false), children: "Obnovit" }), _jsx("button", { type: "button", className: "button-secondary", onClick: () => setShowSettingsModal(true), children: "Nastaven\u00ED" }), _jsx("button", { type: "button", className: "button-primary", onClick: () => {
                                    setEditingPrinter(null);
                                    setShowPrinterModal(true);
                                }, children: "P\u0159idat tisk\u00E1rnu" })] })] }), _jsx(SummaryStrip, { summary: summary }), _jsx(PrinterFilters, { search: search, onSearchChange: setSearch, statusFilter: statusFilter, onStatusFilterChange: setStatusFilter, locationFilter: locationFilter, onLocationFilterChange: setLocationFilter, activeFilter: activeFilter, onActiveFilterChange: setActiveFilter, locations: locations }), error ? _jsx("div", { className: "text-sm text-danger", children: error }) : null, filteredPrinters.length === 0 ? (_jsx(EmptyState, { title: "\u017D\u00E1dn\u00E9 tisk\u00E1rny neodpov\u00EDdaj\u00ED filtru", description: "Zm\u011B\u0148 filtraci nebo p\u0159idejte prvn\u00ED tisk\u00E1rnu do evidence." })) : (_jsx("div", { className: "grid gap-5 xl:grid-cols-2", children: filteredPrinters.map((printer) => (_jsx(PrinterCard, { printer: printer, isBusy: busyPrinterId === printer.id, onEdit: (selectedPrinter) => {
                        setEditingPrinter(selectedPrinter);
                        setShowPrinterModal(true);
                    }, onPoll: (selectedPrinter) => void handlePoll(selectedPrinter) }, printer.id))) })), _jsx(PrinterFormModal, { open: showPrinterModal, mode: editingPrinter ? "edit" : "create", printer: editingPrinter, profiles: listResponse?.profiles ?? [], onClose: () => {
                    setShowPrinterModal(false);
                    setEditingPrinter(null);
                }, onSubmit: handleSavePrinter }), _jsx(SettingsModal, { open: showSettingsModal, settings: settings, onClose: () => setShowSettingsModal(false), onSubmit: async (payload) => {
                    await updateSettings(payload);
                    await loadData(false);
                } })] }));
}
