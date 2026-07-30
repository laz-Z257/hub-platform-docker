import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { registerToken } from "./push.controller";
import { db } from "../../db";
import { pushTokens } from "../../db/schema";

vi.mock("../../db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

describe("Push Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = { body: {}, user: { userId: "user-123" } as any };
    res = {
      json: jsonMock,
      status: statusMock,
    } as Partial<Response>;
    vi.clearAllMocks();
  });

  describe("registerToken", () => {
    it("should register a new token successfully", async () => {
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

      req.body = { token: "push-token-123" };

      await registerToken(req as Request, res as Response);

      expect(db.insert).toHaveBeenCalledWith(pushTokens);
      expect(insertChain.values).toHaveBeenCalledWith({
        user_id: "user-123",
        token: "push-token-123",
      });
      expect(jsonMock).toHaveBeenCalledWith({ message: "Token registrado" });
    });

    it("should return 409 if token belongs to another user", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "token-id", user_id: "other-user" }]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      req.body = { token: "push-token-123" };

      await registerToken(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({ error: "El token ya está registrado por otro usuario" });
    });

    it("should succeed if token already belongs to same user", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "token-id", user_id: "user-123" }]),
          }),
        }),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectChain);

      req.body = { token: "push-token-123" };

      await registerToken(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith({ message: "Token registrado" });
    });
  });
});
