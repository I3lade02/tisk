import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const toneClassMap = {
    default: "from-white to-white",
    accent: "from-accent/5 to-white",
    warn: "from-amber-50 to-white",
    danger: "from-rose-50 to-white"
};
export function MetricCard({ label, value, tone = "default" }) {
    return (_jsxs("div", { className: `panel bg-gradient-to-br ${toneClassMap[tone]} p-5`, children: [_jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.2em] text-slate-500", children: label }), _jsx("div", { className: "mt-3 text-3xl font-semibold text-ink", children: value })] }));
}
