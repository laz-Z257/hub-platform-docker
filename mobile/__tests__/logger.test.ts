import { logger } from "../src/services/logger";

describe("Logger Service", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(console, "debug").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should log info messages", () => {
    logger.info("Test message", { key: "value" });
    expect(console.log).toHaveBeenCalled();
  });

  it("should log warning messages", () => {
    logger.warn("Test warning", { key: "value" });
    expect(console.warn).toHaveBeenCalled();
  });

  it("should log error messages", () => {
    logger.error("Test error", { error: "Something went wrong" });
    expect(console.error).toHaveBeenCalled();
  });

  it("should handle undefined context", () => {
    expect(() => logger.info("Test message")).not.toThrow();
    expect(() => logger.error("Test error")).not.toThrow();
  });

  it("should handle empty context object", () => {
    expect(() => logger.info("Test", {})).not.toThrow();
  });
});