import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deletePrinter, fetchPrinter, fetchPrinters, pollPrinter, updatePrinter } from "../api/printers";
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
    const [printer, setPrinter] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        }
        catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Tiskárnu se nepodařilo načíst.");
        }
        finally {
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
        return _jsx("div", { className: "panel p-8 text-sm text-slate-600", children: "Na\u010D\u00EDt\u00E1m detail tisk\u00E1rny..." });
    }
    if (!printer) {
        return (_jsx(EmptyState, { title: "Tisk\u00E1rna nebyla nalezena", description: error ?? "Záznam neexistuje nebo ho nebylo možné načíst." }));
    }
    const currentPrinter = printer;
    async function handleSave(payload) {
        await updatePrinter(currentPrinter.id, payload);
        await loadData(false);
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsx(Link, { to: "/", className: "text-sm font-semibold text-accent hover:text-accent/80", children: "\u2190 Zp\u011Bt na dashboard" }), _jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-3", children: [_jsx("h1", { className: "font-display text-4xl font-semibold tracking-tight text-ink", children: printer.name }), _jsx(StatusBadge, { state: printer.lastAvailability })] }), _jsxs("div", { className: "mt-2 flex flex-wrap gap-2 text-sm text-slate-600", children: [_jsx("span", { children: printer.ipAddress }), _jsx("span", { className: "text-line", children: "\u2022" }), _jsx("span", { children: printer.lastSeenModel ?? printer.model ?? "Unknown model" }), printer.location ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-line", children: "\u2022" }), _jsx("span", { children: printer.location })] })) : null, printer.department ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "text-line", children: "\u2022" }), _jsx("span", { children: printer.department })] })) : null] })] }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx("button", { type: "button", className: "button-secondary", onClick: () => void loadData(false), children: "Obnovit" }), _jsx("button", { type: "button", className: "button-primary", onClick: async () => {
                                    setIsPolling(true);
                                    try {
                                        await pollPrinter(currentPrinter.id);
                                        await loadData(false);
                                    }
                                    finally {
                                        setIsPolling(false);
                                    }
                                }, disabled: isPolling, children: isPolling ? "Polluji..." : "Spustit poll" }), _jsx("button", { type: "button", className: "button-secondary", onClick: () => setShowEditModal(true), children: "Upravit" }), _jsx("button", { type: "button", className: "button-danger", onClick: async () => {
                                    if (!window.confirm(`Opravdu smazat tiskárnu ${currentPrinter.name}?`)) {
                                        return;
                                    }
                                    setIsDeleting(true);
                                    try {
                                        await deletePrinter(currentPrinter.id);
                                        navigate("/");
                                    }
                                    finally {
                                        setIsDeleting(false);
                                    }
                                }, disabled: isDeleting, children: isDeleting ? "Mažu..." : "Smazat" })] })] }), error ? _jsx("div", { className: "text-sm text-danger", children: error }) : null, _jsxs("div", { className: "grid gap-5 xl:grid-cols-[1.2fr_0.8fr]", children: [_jsxs("section", { className: "panel p-6", children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "rounded-2xl border border-line/80 bg-white/90 p-4", children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500", children: "Stav za\u0159\u00EDzen\u00ED" }), _jsx("div", { className: "mt-2 text-xl font-semibold text-ink", children: printer.lastDeviceStatus ?? "Unknown" })] }), _jsxs("div", { className: "rounded-2xl border border-line/80 bg-white/90 p-4", children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500", children: "Page counter" }), _jsx("div", { className: "mt-2 text-xl font-semibold text-ink", children: formatNumber(printer.lastPageCounter) })] }), _jsxs("div", { className: "rounded-2xl border border-line/80 bg-white/90 p-4", children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500", children: "Posledn\u00ED poll" }), _jsx("div", { className: "mt-2 text-sm font-medium text-ink", children: formatDateTime(printer.lastPolledAt) })] }), _jsxs("div", { className: "rounded-2xl border border-line/80 bg-white/90 p-4", children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500", children: "Posledn\u00ED \u00FAsp\u011B\u0161n\u00FD kontakt" }), _jsx("div", { className: "mt-2 text-sm font-medium text-ink", children: formatDateTime(printer.lastSuccessfulAt) })] })] }), _jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-ink", children: "Tonery" }), _jsxs("span", { className: "text-sm text-slate-500", children: [printer.latestToners.length, " polo\u017Eek"] })] }), _jsx("div", { className: "grid gap-3", children: printer.latestToners.length > 0 ? (printer.latestToners.map((toner) => _jsx(TonerBar, { toner: toner }, toner.key))) : (_jsx("div", { className: "rounded-2xl border border-dashed border-line bg-white/70 p-4 text-sm text-slate-500", children: "Toner data nejsou dostupn\u00E1." })) })] })] }), _jsxs("section", { className: "panel p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-ink", children: "Pap\u00EDrov\u00E9 z\u00E1sobn\u00EDky" }), _jsx("button", { type: "button", className: "button-secondary px-3 py-2", onClick: () => setShowRaw((current) => !current), children: showRaw ? "Skrýt raw SNMP" : "Zobrazit raw SNMP" })] }), _jsx("div", { className: "mt-4", children: _jsx(TrayGrid, { trays: printer.latestTrays }) }), showRaw ? (_jsx("div", { className: "mt-6 rounded-2xl border border-line bg-slate-950 p-4 text-xs text-slate-100", children: _jsx("pre", { children: JSON.stringify(printer.rawSnapshot ?? {}, null, 2) }) })) : null] })] }), _jsxs("section", { className: "panel p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-ink", children: "Historie" }), _jsx("div", { className: "mt-4", children: _jsx(PrinterHistoryTable, { history: printer.history }) })] }), _jsx(PrinterFormModal, { open: showEditModal, mode: "edit", printer: currentPrinter, profiles: profiles, onClose: () => setShowEditModal(false), onSubmit: handleSave })] }));
}
