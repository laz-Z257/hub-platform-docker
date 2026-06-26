type LogLevel = "info" | "warn" | "error" | "debug";

function formatTimestamp() {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: Record<string, unknown> = {
    timestamp: formatTimestamp(),
    level,
    message,
  };
  if (meta && Object.keys(meta).length > 0) {
    entry.meta = meta;
  }
  const output = JSON.stringify(entry);
  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production") console.debug(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log("debug", message, meta),
};
