import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from "react-router-dom";
export function Layout({ children }) {
    const location = useLocation();
    return (_jsxs("div", { className: "min-h-screen text-ink", children: [_jsx("header", { className: "border-b border-line/70 bg-panel/70 backdrop-blur-sm", children: _jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8", children: [_jsxs("div", { children: [_jsx(Link, { to: "/", className: "font-display text-2xl font-semibold tracking-tight text-ink", children: "Tisk Monitor" }), _jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Intern\u00ED monitoring s\u00ED\u0165ov\u00FDch tisk\u00E1ren p\u0159es SNMP." })] }), _jsx("nav", { className: "flex items-center gap-2 rounded-full border border-line bg-white/80 p-1", children: _jsx(Link, { to: "/", className: `rounded-full px-4 py-2 text-sm font-medium transition ${location.pathname === "/"
                                    ? "bg-accent text-white"
                                    : "text-slate-700 hover:bg-accent/10"}`, children: "Dashboard" }) })] }) }), _jsx("main", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8", children: children })] }));
}
