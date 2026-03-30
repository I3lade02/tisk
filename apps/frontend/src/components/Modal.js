import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Modal({ open, title, onClose, children }) {
    if (!open) {
        return null;
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-start justify-center bg-slate-950/45 px-4 py-10 backdrop-blur-sm", children: _jsxs("div", { className: "panel w-full max-w-2xl overflow-hidden", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-line/80 px-6 py-4", children: [_jsx("h2", { className: "font-display text-xl font-semibold text-ink", children: title }), _jsx("button", { type: "button", className: "button-secondary px-3 py-2", onClick: onClose, children: "Zav\u0159\u00EDt" })] }), _jsx("div", { className: "px-6 py-6", children: children })] }) }));
}
