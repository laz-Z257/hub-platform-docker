import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { getSettings, updateSettings } from "./settings.controller";
import { db } from "../../db";
import { companySettings } from "../../db/schema";

vi.mock("../../db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe("Settings Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = { body: {} };
    res = {
      json: jsonMock,
      status: statusMock,
    } as Partial<Response>;
    vi.clearAllMocks();
  });

  describe("getSettings", () => {
    it("should return settings when they exist", async () => {
      const mockSettings = {
        id: "test-id",
        key: "default",
        nombre: "Test Company",
        contribuyente: "123456789",
        direccion: "Test Address",
        updated_at: new Date(),
      };

      const selectChain = {
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockSettings]),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      await getSettings(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(mockSettings);
    });

    it("should return default values when no settings exist", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      await getSettings(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        nombre: "",
        contribuyente: "",
        direccion: "",
      });
    });
  });

  describe("updateSettings", () => {
    it("should use UPSERT to avoid race conditions", async () => {
      const mockResult = {
        id: "test-id",
        key: "default",
        nombre: "Updated Company",
        contribuyente: "987654321",
        direccion: "Updated Address",
        updated_at: new Date(),
      };

      const insertChain = {
        values: vi.fn().mockReturnValue({
          onConflictDoUpdate: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockResult]),
          }),
        }),
      };
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain);

      req.body = {
        nombre: "Updated Company",
        contribuyente: "987654321",
        direccion: "Updated Address",
      };

      await updateSettings(req as Request, res as Response);

      expect(db.insert).toHaveBeenCalledWith(companySettings);
      expect(insertChain.values).toHaveBeenCalledWith({
        key: "default",
        nombre: "Updated Company",
        contribuyente: "987654321",
        direccion: "Updated Address",
      });
      expect(insertChain.values().onConflictDoUpdate).toHaveBeenCalledWith({
        target: companySettings.key,
        set: expect.objectContaining({
          nombre: expect.anything(),
          contribuyente: expect.anything(),
          direccion: expect.anything(),
        }),
      });
      expect(jsonMock).toHaveBeenCalledWith(mockResult);
    });
  });
});
