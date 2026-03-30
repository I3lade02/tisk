import { env } from "../config/env.js";

const levelOrder = ["debug", "info", "warn", "error"] as const;
const currentLevelIndex = levelOrder.indexOf(env.logLevel);

function shouldLog(level: (typeof levelOrder)[number]) {
  return levelOrder.indexOf(level) >= currentLevelIndex;
}

function format(level: string, message: string) {
  return `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}`;
}

export const logger = {
  debug(message: string, meta?: unknown) {
    if (!shouldLog("debug")) {
      return;
    }

    console.debug(format("debug", message), meta ?? "");
  },
  info(message: string, meta?: unknown) {
    if (!shouldLog("info")) {
      return;
    }

    console.info(format("info", message), meta ?? "");
  },
  warn(message: string, meta?: unknown) {
    if (!shouldLog("warn")) {
      return;
    }

    console.warn(format("warn", message), meta ?? "");
  },
  error(message: string, meta?: unknown) {
    if (!shouldLog("error")) {
      return;
    }

    console.error(format("error", message), meta ?? "");
  }
};
