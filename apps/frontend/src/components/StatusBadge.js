import { jsx as _jsx } from "react/jsx-runtime";
import { availabilityLabel } from "../lib/constants";
const stateClassMap = {
    ready: "bg-success/10 text-success ring-success/15",
    idle: "bg-accent/10 text-accent ring-accent/15",
    warning: "bg-amber-100 text-amber-800 ring-amber-200",
    error: "bg-danger/10 text-danger ring-danger/15",
    offline: "bg-rose-100 text-rose-700 ring-rose-200",
    unknown: "bg-slate-100 text-slate-600 ring-slate-200"
};
export function StatusBadge({ state }) {
    const normalized = state ?? "unknown";
    return (_jsx("span", { className: `inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ring-1 ${stateClassMap[normalized]}`, children: availabilityLabel[normalized] }));
}
