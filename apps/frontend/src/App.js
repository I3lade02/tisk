import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { PrinterDetailPage } from "./pages/PrinterDetailPage";
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/printers/:id", element: _jsx(PrinterDetailPage, {}) })] }) }) }));
}
