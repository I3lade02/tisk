import { db } from "./connection.js";

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS printers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ip_address TEXT NOT NULL UNIQUE,
      location TEXT,
      department TEXT,
      notes TEXT,
      model TEXT,
      snmp_community TEXT NOT NULL,
      profile_id TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      last_polled_at TEXT,
      last_successful_at TEXT,
      last_seen_model TEXT,
      last_online INTEGER,
      last_device_status TEXT,
      last_availability TEXT,
      last_page_counter INTEGER,
      last_error_message TEXT,
      last_snapshot_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS printer_status_history (
      id TEXT PRIMARY KEY,
      printer_id TEXT NOT NULL,
      checked_at TEXT NOT NULL,
      is_online INTEGER NOT NULL,
      availability TEXT NOT NULL,
      device_status TEXT,
      page_counter INTEGER,
      model TEXT,
      error_message TEXT,
      raw_snapshot_json TEXT,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS toner_levels_history (
      id TEXT PRIMARY KEY,
      history_id TEXT NOT NULL,
      printer_id TEXT NOT NULL,
      checked_at TEXT NOT NULL,
      toner_key TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      current_value INTEGER,
      max_value INTEGER,
      percent REAL,
      state TEXT NOT NULL,
      FOREIGN KEY (history_id) REFERENCES printer_status_history(id) ON DELETE CASCADE,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tray_status_history (
      id TEXT PRIMARY KEY,
      history_id TEXT NOT NULL,
      printer_id TEXT NOT NULL,
      checked_at TEXT NOT NULL,
      tray_key TEXT NOT NULL,
      name TEXT NOT NULL,
      capacity INTEGER,
      current_value INTEGER,
      percent REAL,
      state TEXT NOT NULL,
      FOREIGN KEY (history_id) REFERENCES printer_status_history(id) ON DELETE CASCADE,
      FOREIGN KEY (printer_id) REFERENCES printers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_printers_active ON printers(is_active);
    CREATE INDEX IF NOT EXISTS idx_printers_last_online ON printers(last_online);
    CREATE INDEX IF NOT EXISTS idx_status_history_printer_checked ON printer_status_history(printer_id, checked_at DESC);
    CREATE INDEX IF NOT EXISTS idx_toner_history_printer_checked ON toner_levels_history(printer_id, checked_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tray_history_printer_checked ON tray_status_history(printer_id, checked_at DESC);
  `);
}
