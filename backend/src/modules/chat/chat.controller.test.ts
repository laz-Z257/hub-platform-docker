import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { sendMessage, getHistory } from "./chat.controller";
import { db } from "../../db";
import { messages } from "../../db/schema";

vi.mock("../../db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

describe("Chat Controller", () => {
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

  describe("sendMessage", () => {
    it("should send message and get bot response", async () => {
      const insertChain = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: "msg-id",
            user_id: "user-123",
            content: "Hola",
            is_bot: false,
            created_at: new Date(),
          }]),
        }),
      };
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(insertChain);

      req.body = { content: "Hola" };

      await sendMessage(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userMessage: expect.objectContaining({ content: "Hola" }),
          botMessage: expect.any(Object),
          suggestedActions: expect.any(Array),
        })
      );
    });
  });

  describe("getHistory", () => {
    it("should return chat history", async () => {
      const selectChain = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([
                  { id: "msg-1", content: "Hola", is_bot: false },
                  { id: "msg-2", content: "¿Cómo puedo ayudarte?", is_bot: true },
                ]),
              }),
            }),
          }),
        }),
      };

      const countSelect = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: 2 }]),
        }),
      };

      (db.select as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(countSelect);

      req.validatedQuery = { page: 1, limit: 50 };

      await getHistory(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.any(Array),
          total: 2,
          page: 1,
        })
      );
    });
  });
});
