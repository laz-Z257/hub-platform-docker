import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { redirectToModule } from "./external-systems.controller";

vi.mock("../../config/env", () => ({
  env: { EXTERNAL_SYSTEMS_URL: "http://192.168.60.66:8100/Seguridad-WEB/XHTML/general/login.xhtml" },
}));

describe("External Systems Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;
  let redirectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    redirectMock = vi.fn();
    res = {
      json: jsonMock,
      status: statusMock,
      redirect: redirectMock,
    } as Partial<Response>;
  });

  it("redirects traslados to the configured URL", () => {
    req = { params: { module: "traslados" } };

    redirectToModule(req as Request, res as Response);

    expect(redirectMock).toHaveBeenCalledWith(
      302,
      "http://192.168.60.66:8100/Seguridad-WEB/XHTML/general/login.xhtml"
    );
  });

  it("returns 404 for unknown or unconfigured modules", () => {
    req = { params: { module: "inventario" } };

    redirectToModule(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Módulo externo no configurado" });
  });
});
