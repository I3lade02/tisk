import type {
  AppSettings,
  DashboardSummary,
  PollResult,
  PrinterDetail,
  PrinterFormData,
  PrinterSummary,
  SettingsFormData
} from "@tisk/shared";

import { apiFetch } from "./client";

export interface PrinterProfileOption {
  id: string;
  name: string;
}

export interface PrinterListResponse {
  items: PrinterSummary[];
  profiles: PrinterProfileOption[];
}

export function fetchPrinters() {
  return apiFetch<PrinterListResponse>("/api/printers");
}

export function fetchPrinter(id: string) {
  return apiFetch<PrinterDetail>(`/api/printers/${id}`);
}

export function createPrinter(payload: PrinterFormData) {
  return apiFetch<PrinterSummary>("/api/printers", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updatePrinter(id: string, payload: PrinterFormData) {
  return apiFetch<PrinterSummary>(`/api/printers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deletePrinter(id: string) {
  return apiFetch<void>(`/api/printers/${id}`, {
    method: "DELETE"
  });
}

export function pollPrinter(id: string) {
  return apiFetch<PollResult>(`/api/printers/${id}/poll`, {
    method: "POST"
  });
}

export function fetchSummary() {
  return apiFetch<DashboardSummary>("/api/dashboard/summary");
}

export function fetchSettings() {
  return apiFetch<AppSettings>("/api/settings");
}

export function updateSettings(payload: SettingsFormData) {
  return apiFetch<AppSettings>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
