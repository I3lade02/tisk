import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from "../../components/MetricCard";
import { formatDateTime } from "../../lib/format";
export function SummaryStrip({ summary }) {
    return (_jsxs("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-4", children: [_jsx(MetricCard, { label: "Celkem tisk\u00E1ren", value: summary?.total ?? "0" }), _jsx(MetricCard, { label: "Online", value: summary?.online ?? "0", tone: "accent" }), _jsx(MetricCard, { label: "Warning", value: summary?.warnings ?? "0", tone: "warn" }), _jsx(MetricCard, { label: "Posledn\u00ED kontrola", value: formatDateTime(summary?.lastCheckAt ?? null) })] }));
}
