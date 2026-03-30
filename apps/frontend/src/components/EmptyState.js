import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function EmptyState({ title, description }) {
    return (_jsxs("div", { className: "panel border-dashed p-10 text-center", children: [_jsx("h3", { className: "text-lg font-semibold text-ink", children: title }), _jsx("p", { className: "mt-2 text-sm text-slate-600", children: description })] }));
}
