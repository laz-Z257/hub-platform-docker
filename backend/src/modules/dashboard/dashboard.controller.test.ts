import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { getKpis } from "./dashboard.controller";
import { db } from "../../db";

vi.mock("../../db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{
          totalIncidentes: 10,
          pendientes: 3,
          enProceso: 2,
          resueltos: 5,
          altaUrgencia: 1,
        }]),
      }),
    }),
  },
}));

describe("Dashboard Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = { body: {}, validatedQuery: {} };
    res = {
      json: jsonMock,
      status: statusMock,
    } as Partial<Response>;
    vi.clearAllMocks();
  });

  describe("getKpis", () => {
    it("should return KPIs successfully", async () => {
      await getKpis(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalled();
    });
  });
});
