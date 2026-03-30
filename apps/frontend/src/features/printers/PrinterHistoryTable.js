import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime, formatNumber } from "../../lib/format";
export function PrinterHistoryTable({ history }) {
    if (history.length === 0) {
        return (_jsx("div", { className: "rounded-2xl border border-dashed border-line bg-white/60 p-5 text-sm text-slate-500", children: "Historie zat\u00EDm neobsahuje \u017E\u00E1dn\u00E9 z\u00E1znamy." }));
    }
    return (_jsx("div", { className: "overflow-hidden rounded-3xl border border-line bg-white/90", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-line text-sm", children: [_jsx("thead", { className: "bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3", children: "\u010Cas" }), _jsx("th", { className: "px-4 py-3", children: "Dostupnost" }), _jsx("th", { className: "px-4 py-3", children: "Status" }), _jsx("th", { className: "px-4 py-3", children: "Page counter" }), _jsx("th", { className: "px-4 py-3", children: "Toner" })] }) }), _jsx("tbody", { className: "divide-y divide-line/70", children: history.map((entry) => (_jsxs("tr", { className: "align-top", children: [_jsx("td", { className: "px-4 py-3 text-slate-600", children: formatDateTime(entry.checkedAt) }), _jsx("td", { className: "px-4 py-3", children: _jsx(StatusBadge, { state: entry.availability }) }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: entry.deviceStatus ?? "Unknown" }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: formatNumber(entry.pageCounter) }), _jsx("td", { className: "px-4 py-3 text-slate-700", children: entry.toners.length === 0
                                        ? "Unknown"
                                        : entry.toners.map((toner) => `${toner.name}: ${toner.percent ?? "?"}%`).join(" | ") })] }, entry.id))) })] }) }) }));
}
