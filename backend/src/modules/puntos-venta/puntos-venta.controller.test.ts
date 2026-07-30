import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { listPuntosVenta, seedPuntosVenta } from "./puntos-venta.controller";
import { db } from "../../db";
import { puntosVenta } from "../../db/schema";

vi.mock("../../db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

describe("Puntos Venta Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = { query: {} };
    res = {
      json: jsonMock,
      status: statusMock,
    } as Partial<Response>;
    vi.clearAllMocks();
  });

  describe("listPuntosVenta", () => {
    it("should return all puntos de venta", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: "pv-1", nombre: "PV-001", activo: true },
                { id: "pv-2", nombre: "PV-002", activo: true },
              ]),
            }),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      await listPuntosVenta(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith([
        expect.objectContaining({ nombre: "PV-001" }),
        expect.objectContaining({ nombre: "PV-002" }),
      ]);
    });

    it("should filter by search query", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: "pv-1", nombre: "PV-001-Central", activo: true },
              ]),
            }),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      req.query = { search: "Central" };

      await listPuntosVenta(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith([
        expect.objectContaining({ nombre: "PV-001-Central" }),
      ]);
    });
  });

  describe("seedPuntosVenta", () => {
    it("should create new puntos de venta", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      const insertChain = {
        values: vi.fn().mockResolvedValue(undefined),
      };
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain);

      await seedPuntosVenta(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: true,
          created: expect.any(Number),
          total: expect.any(Number),
        })
      );
    });
  });
});
