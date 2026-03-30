import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { tonerColorClass } from "../lib/constants";
import { formatPercent } from "../lib/format";
export function TonerBar({ toner }) {
    const width = toner.percent ?? 0;
    const isAlert = toner.state === "low" || toner.state === "empty";
    return (_jsxs("div", { className: "rounded-2xl border border-line/80 bg-white/90 p-3", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between gap-3", children: [_jsx("span", { className: "text-sm font-medium text-ink", children: toner.name }), _jsx("span", { className: `text-sm font-semibold ${isAlert ? "text-danger" : "text-slate-600"}`, children: formatPercent(toner.percent) })] }), _jsx("div", { className: "h-3 overflow-hidden rounded-full bg-slate-200", children: _jsx("div", { className: `h-full rounded-full ${tonerColorClass[toner.color]}`, style: { width: `${width}%` } }) }), _jsxs("div", { className: "mt-2 text-xs text-slate-500", children: [toner.current ?? "?", " / ", toner.max ?? "?"] })] }));
}
