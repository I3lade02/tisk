import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatPercent } from "../lib/format";
export function TrayGrid({ trays }) {
    if (trays.length === 0) {
        return (_jsx("div", { className: "rounded-2xl border border-dashed border-line bg-white/60 p-5 text-sm text-slate-500", children: "\u017D\u00E1dn\u00E1 tray data nejsou k dispozici." }));
    }
    return (_jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: trays.map((tray) => (_jsxs("div", { className: "rounded-2xl border border-line/80 bg-white/90 p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-ink", children: tray.name }), _jsx("div", { className: "mt-1 text-xs uppercase tracking-[0.18em] text-slate-500", children: tray.state })] }), _jsx("div", { className: "text-sm font-semibold text-slate-700", children: formatPercent(tray.percent) })] }), _jsx("div", { className: "mt-4 h-2 overflow-hidden rounded-full bg-slate-200", children: _jsx("div", { className: `h-full rounded-full ${tray.state === "empty"
                            ? "bg-danger"
                            : tray.state === "low"
                                ? "bg-amber-500"
                                : "bg-accent"}`, style: { width: `${tray.percent ?? 0}%` } }) }), _jsxs("div", { className: "mt-2 text-xs text-slate-500", children: [tray.current ?? "?", " / ", tray.capacity ?? "?"] })] }, tray.key))) }));
}
