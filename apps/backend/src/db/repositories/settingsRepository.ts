import type { AppSettings } from "@tisk/shared";

import { env } from "../../config/env.js";
import { db } from "../connection.js";
import { nowIso } from "../../utils/time.js";

const defaultSettings = {
  pollIntervalSeconds: env.pollIntervalSeconds,
  tonerWarningThreshold: env.tonerWarningThreshold,
  historyRetentionDays: env.historyRetentionDays
};

let insertIfMissingStatement: ReturnType<typeof db.prepare> | null = null;
let upsertStatement: ReturnType<typeof db.prepare> | null = null;
let selectAllStatement: ReturnType<typeof db.prepare> | null = null;

function getInsertIfMissingStatement() {
  insertIfMissingStatement ??= db.prepare(`
    INSERT OR IGNORE INTO app_settings (key, value, updated_at)
    VALUES (@key, @value, @updatedAt)
  `);

  return insertIfMissingStatement;
}

function getUpsertStatement() {
  upsertStatement ??= db.prepare(`
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (@key, @value, @updatedAt)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `);

  return upsertStatement;
}

function getSelectAllStatement() {
  selectAllStatement ??= db.prepare(`
    SELECT key, value, updated_at
    FROM app_settings
  `);

  return selectAllStatement;
}

export class SettingsRepository {
  ensureDefaults() {
    const timestamp = nowIso();

    getInsertIfMissingStatement().run({
      key: "pollIntervalSeconds",
      value: String(defaultSettings.pollIntervalSeconds),
      updatedAt: timestamp
    });

    getInsertIfMissingStatement().run({
      key: "tonerWarningThreshold",
      value: String(defaultSettings.tonerWarningThreshold),
      updatedAt: timestamp
    });

    getInsertIfMissingStatement().run({
      key: "historyRetentionDays",
      value:
        defaultSettings.historyRetentionDays === null
          ? ""
          : String(defaultSettings.historyRetentionDays),
      updatedAt: timestamp
    });
  }

  getSettings(): AppSettings {
    const rows = getSelectAllStatement().all() as Array<{
      key: string;
      value: string;
      updated_at: string;
    }>;

    const settings: AppSettings = {
      pollIntervalSeconds: defaultSettings.pollIntervalSeconds,
      tonerWarningThreshold: defaultSettings.tonerWarningThreshold,
      historyRetentionDays: defaultSettings.historyRetentionDays,
      updatedAt: "1970-01-01T00:00:00.000Z"
    };

    for (const row of rows) {
      if (row.key === "pollIntervalSeconds") {
        settings.pollIntervalSeconds = Number(row.value);
      }

      if (row.key === "tonerWarningThreshold") {
        settings.tonerWarningThreshold = Number(row.value);
      }

      if (row.key === "historyRetentionDays") {
        settings.historyRetentionDays = row.value ? Number(row.value) : null;
      }

      if (row.updated_at > settings.updatedAt) {
        settings.updatedAt = row.updated_at;
      }
    }

    if (settings.updatedAt === "1970-01-01T00:00:00.000Z") {
      settings.updatedAt = nowIso();
    }

    return settings;
  }

  updateSettings(input: Omit<AppSettings, "updatedAt">): AppSettings {
    const updatedAt = nowIso();

    getUpsertStatement().run({
      key: "pollIntervalSeconds",
      value: String(input.pollIntervalSeconds),
      updatedAt
    });

    getUpsertStatement().run({
      key: "tonerWarningThreshold",
      value: String(input.tonerWarningThreshold),
      updatedAt
    });

    getUpsertStatement().run({
      key: "historyRetentionDays",
      value: input.historyRetentionDays === null ? "" : String(input.historyRetentionDays),
      updatedAt
    });

    return this.getSettings();
  }
}
