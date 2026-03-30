import { apiFetch } from "./client";
export function fetchPrinters() {
    return apiFetch("/api/printers");
}
export function fetchPrinter(id) {
    return apiFetch(`/api/printers/${id}`);
}
export function createPrinter(payload) {
    return apiFetch("/api/printers", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
export function updatePrinter(id, payload) {
    return apiFetch(`/api/printers/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}
export function deletePrinter(id) {
    return apiFetch(`/api/printers/${id}`, {
        method: "DELETE"
    });
}
export function pollPrinter(id) {
    return apiFetch(`/api/printers/${id}/poll`, {
        method: "POST"
    });
}
export function fetchSummary() {
    return apiFetch("/api/dashboard/summary");
}
export function fetchSettings() {
    return apiFetch("/api/settings");
}
export function updateSettings(payload) {
    return apiFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}
