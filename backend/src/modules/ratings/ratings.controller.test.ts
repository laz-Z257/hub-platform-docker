import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { createRating, getRating, getMyRatedIncidents } from "./ratings.controller";
import { db } from "../../db";
import { ratings, incidents } from "../../db/schema";

vi.mock("../../db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

describe("Ratings Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = { body: {}, params: {}, user: { userId: "user-123", rol: "user" } as any };
    res = {
      json: jsonMock,
      status: statusMock,
    } as Partial<Response>;
    vi.clearAllMocks();
  });

  describe("createRating", () => {
    it("should return 400 for invalid puntuacion", async () => {
      req.params = { id: "incident-id" };
      req.body = { puntuacion: 6 };

      await createRating(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: "La puntuación debe ser un número entre 1 y 5" });
    });

    it("should return 404 if incident not found", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      req.params = { id: "incident-id" };
      req.body = { puntuacion: 5 };

      await createRating(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Incidente no encontrado" });
    });

    it("should return 400 if incident is not resolved", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: "incident-id",
              user_id: "user-123",
              estado: "pendiente",
            }]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      req.params = { id: "incident-id" };
      req.body = { puntuacion: 5 };

      await createRating(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Solo puedes calificar tickets resueltos" });
    });

    it("should create rating successfully", async () => {
      const incidentSelect = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: "incident-id",
              user_id: "user-123",
              estado: "resuelto",
            }]),
          }),
        }),
      };

      const ratingSelect = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      };

      (db.select as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(incidentSelect)
        .mockReturnValueOnce(ratingSelect);

      const insertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: "rating-id",
            incident_id: "incident-id",
            user_id: "user-123",
            puntuacion: 5,
            comentario: "Excelente servicio",
          }]),
        }),
      };
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain);

      req.params = { id: "incident-id" };
      req.body = { puntuacion: 5, comentario: "Excelente servicio" };

      await createRating(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          puntuacion: 5,
        })
      );
    });
  });

  describe("getRating", () => {
    it("should return 404 if incident not found", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      req.params = { id: "incident-id" };

      await getRating(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Incidente no encontrado" });
    });

    it("should return rating if exists", async () => {
      const incidentSelect = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "incident-id" }]),
          }),
        }),
      };

      const ratingSelect = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{
              id: "rating-id",
              incident_id: "incident-id",
              puntuacion: 5,
            }]),
          }),
        }),
      };

      (db.select as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(incidentSelect)
        .mockReturnValueOnce(ratingSelect);

      req.params = { id: "incident-id" };

      await getRating(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          puntuacion: 5,
        })
      );
    });
  });

  describe("getMyRatedIncidents", () => {
    it("should return rated incident IDs", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              { incident_id: "incident-1" },
              { incident_id: "incident-2" },
            ]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      await getMyRatedIncidents(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        ratedIncidentIds: ["incident-1", "incident-2"],
      });
    });
  });
});
