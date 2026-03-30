import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { startTransition } from "react";
export function PrinterFilters({ search, onSearchChange, statusFilter, onStatusFilterChange, locationFilter, onLocationFilterChange, activeFilter, onActiveFilterChange, locations }) {
    return (_jsx("div", { className: "panel p-5", children: _jsxs("div", { className: "grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr]", children: [_jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "search", children: "Vyhled\u00E1v\u00E1n\u00ED" }), _jsx("input", { id: "search", className: "field", placeholder: "N\u00E1zev, IP nebo model", value: search, onChange: (event) => startTransition(() => {
                                onSearchChange(event.target.value);
                            }) })] }), _jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "statusFilter", children: "Stav" }), _jsxs("select", { id: "statusFilter", className: "field", value: statusFilter, onChange: (event) => startTransition(() => {
                                onStatusFilterChange(event.target.value);
                            }), children: [_jsx("option", { value: "all", children: "V\u0161e" }), _jsx("option", { value: "online", children: "Online" }), _jsx("option", { value: "offline", children: "Offline" }), _jsx("option", { value: "warning", children: "Warning" }), _jsx("option", { value: "error", children: "Error" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "locationFilter", children: "Lokalita" }), _jsxs("select", { id: "locationFilter", className: "field", value: locationFilter, onChange: (event) => startTransition(() => {
                                onLocationFilterChange(event.target.value);
                            }), children: [_jsx("option", { value: "", children: "V\u0161e" }), locations.map((location) => (_jsx("option", { value: location, children: location }, location)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "label", htmlFor: "activeFilter", children: "Evidence" }), _jsxs("select", { id: "activeFilter", className: "field", value: activeFilter, onChange: (event) => startTransition(() => {
                                onActiveFilterChange(event.target.value);
                            }), children: [_jsx("option", { value: "all", children: "V\u0161e" }), _jsx("option", { value: "active", children: "Aktivn\u00ED" }), _jsx("option", { value: "inactive", children: "Neaktivn\u00ED" })] })] })] }) }));
}
