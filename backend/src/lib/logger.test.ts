import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "./logger";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("logger", () => {
  it("logger.info calls console.log with JSON", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test message");
    expect(spy).toHaveBeenCalledTimes(1);
    const arg = spy.mock.calls[0][0];
    const parsed = JSON.parse(arg);
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("test message");
    expect(parsed.timestamp).toBeTruthy();
    expect(parsed.meta).toBeUndefined();
  });

  it("logger.info includes meta when provided", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("with meta", { userId: "123", count: 5 });
    const arg = spy.mock.calls[0][0];
    const parsed = JSON.parse(arg);
    expect(parsed.meta).toEqual({ userId: "123", count: 5 });
  });

  it("logger.warn calls console.warn with JSON", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    logger.warn("warning");
    expect(spy).toHaveBeenCalledTimes(1);
    const arg = spy.mock.calls[0][0];
    const parsed = JSON.parse(arg);
    expect(parsed.level).toBe("warn");
    expect(parsed.message).toBe("warning");
  });

  it("logger.error calls console.error with JSON", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("error message");
    expect(spy).toHaveBeenCalledTimes(1);
    const arg = spy.mock.calls[0][0];
    const parsed = JSON.parse(arg);
    expect(parsed.level).toBe("error");
    expect(parsed.message).toBe("error message");
  });

  it("logger.debug calls console.debug in non-production", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    logger.debug("debug message");
    expect(spy).toHaveBeenCalledTimes(1);
    const arg = spy.mock.calls[0][0];
    const parsed = JSON.parse(arg);
    expect(parsed.level).toBe("debug");
  });

  it("logger.debug does not call console.debug in production", () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    logger.debug("should not log");
    expect(spy).not.toHaveBeenCalled();
    process.env.NODE_ENV = original;
  });

  it("omits meta key when meta is empty", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("no meta", {});
    const arg = spy.mock.calls[0][0];
    const parsed = JSON.parse(arg);
    expect(parsed.meta).toBeUndefined();
  });
});
