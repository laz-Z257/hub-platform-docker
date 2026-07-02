import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "./logger";

beforeEach(() => {
  vi.restoreAllMocks();
});

function getTimestampRegex() {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
}

describe("logger", () => {
  it("info calls console.log with JSON", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test info");
    expect(spy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spy.mock.calls[0][0]);
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("test info");
    expect(parsed.timestamp).toMatch(getTimestampRegex());
  });

  it("includes meta when provided", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("with meta", { key: "value" });
    const parsed = JSON.parse(spy.mock.calls[0][0]);
    expect(parsed.meta).toEqual({ key: "value" });
  });

  it("warn calls console.warn", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("warning");
    expect(spy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spy.mock.calls[0][0]);
    expect(parsed.level).toBe("warn");
  });

  it("error calls console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("error");
    expect(spy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(spy.mock.calls[0][0]);
    expect(parsed.level).toBe("error");
  });

  it("debug calls console.debug in non-production", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    logger.debug("debug msg");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("skips empty meta", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("no meta", {});
    const parsed = JSON.parse(spy.mock.calls[0][0]);
    expect(parsed.meta).toBeUndefined();
  });
});
