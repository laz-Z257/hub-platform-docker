import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("dotenv", () => ({
  default: { config: vi.fn() },
}));

beforeEach(() => {
  vi.resetModules();
});

describe("env configuration", () => {
  it("throws when JWT_SECRET is missing", async () => {
    await expect(async () => {
      process.env = { DATABASE_URL: "postgres://test:test@localhost:5432/test", JWT_REFRESH_SECRET: "refresh" };
      await import("./env");
    }).rejects.toThrow("JWT_SECRET es requerida");
  });

  it("throws when JWT_REFRESH_SECRET is missing", async () => {
    await expect(async () => {
      process.env = { DATABASE_URL: "postgres://test:test@localhost:5432/test", JWT_SECRET: "secret" };
      await import("./env");
    }).rejects.toThrow("JWT_REFRESH_SECRET es requerida");
  });

  it("throws when JWT_SECRET is empty string", async () => {
    await expect(async () => {
      process.env = { DATABASE_URL: "postgres://test:test@localhost:5432/test", JWT_SECRET: "  ", JWT_REFRESH_SECRET: "refresh" };
      await import("./env");
    }).rejects.toThrow("JWT_SECRET es requerida");
  });

  it("throws when JWT_REFRESH_SECRET is empty string", async () => {
    await expect(async () => {
      process.env = { DATABASE_URL: "postgres://test:test@localhost:5432/test", JWT_SECRET: "secret", JWT_REFRESH_SECRET: "" };
      await import("./env");
    }).rejects.toThrow("JWT_REFRESH_SECRET es requerida");
  });

  it("parses PORT as integer", async () => {
    process.env = {
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      JWT_SECRET: "secret",
      JWT_REFRESH_SECRET: "refresh",
      PORT: "4000",
    };
    const { env } = await import("./env");
    expect(env.PORT).toBe(4000);
  });

  it("defaults PORT to 3001", async () => {
    process.env = {
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      JWT_SECRET: "secret",
      JWT_REFRESH_SECRET: "refresh",
    };
    const { env } = await import("./env");
    expect(env.PORT).toBe(3001);
  });

  it("defaults NODE_ENV to development", async () => {
    process.env = {
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      JWT_SECRET: "secret",
      JWT_REFRESH_SECRET: "refresh",
    };
    const { env } = await import("./env");
    expect(env.NODE_ENV).toBe("development");
  });

  it("defaults EMAIL_DOMAIN to hub.ai", async () => {
    process.env = {
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      JWT_SECRET: "secret",
      JWT_REFRESH_SECRET: "refresh",
    };
    const { env } = await import("./env");
    expect(env.EMAIL_DOMAIN).toBe("hub.ai");
  });

  it("reads EMAIL_DOMAIN from env", async () => {
    process.env = {
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      JWT_SECRET: "secret",
      JWT_REFRESH_SECRET: "refresh",
      EMAIL_DOMAIN: "custom.ai",
    };
    const { env } = await import("./env");
    expect(env.EMAIL_DOMAIN).toBe("custom.ai");
  });

  it("parses DB_SSL as boolean", async () => {
    process.env = {
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      JWT_SECRET: "secret",
      JWT_REFRESH_SECRET: "refresh",
      DB_SSL: "true",
    };
    const { env } = await import("./env");
    expect(env.DB_SSL).toBe(true);
  });

  it("defaults DB_SSL to false", async () => {
    process.env = {
      DATABASE_URL: "postgres://test:test@localhost:5432/test",
      JWT_SECRET: "secret",
      JWT_REFRESH_SECRET: "refresh",
    };
    const { env } = await import("./env");
    expect(env.DB_SSL).toBe(false);
  });
});
