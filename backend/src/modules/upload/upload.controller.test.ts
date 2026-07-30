import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { uploadFile } from "./upload.controller";
import fs from "node:fs";

vi.mock("node:fs", () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    renameSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

describe("Upload Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = { file: undefined };
    res = {
      json: jsonMock,
      status: statusMock,
    } as Partial<Response>;
    vi.clearAllMocks();
    (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (fs.readdirSync as ReturnType<typeof vi.fn>).mockReturnValue([]);
  });

  describe("uploadFile", () => {
    it("should return 400 if no file provided", async () => {
      req.file = undefined;

      await uploadFile(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: "No se envió ningún archivo" });
    });

    it("should return 400 for invalid file extension", async () => {
      req.file = {
        originalname: "document.pdf",
        size: 1000,
      } as any;

      await uploadFile(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Formato no permitido. Usa: png, jpg, jpeg, gif, webp" });
    });

    it("should return 400 if file exceeds 5MB", async () => {
      req.file = {
        originalname: "image.png",
        size: 6 * 1024 * 1024,
      } as any;

      await uploadFile(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: "La imagen no puede superar los 5MB" });
    });

    it("should upload valid image successfully", async () => {
      req.file = {
        originalname: "image.png",
        size: 1000,
        path: "/tmp/temp-file",
      } as any;

      (fs.readdirSync as ReturnType<typeof vi.fn>).mockReturnValue([]);
      (fs.renameSync as ReturnType<typeof vi.fn>).mockImplementation(() => {});
      (fs.writeFileSync as ReturnType<typeof vi.fn>).mockImplementation(() => {});

      await uploadFile(req as Request, res as Response);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining("/uploads/"),
        })
      );
    });
  });
});
