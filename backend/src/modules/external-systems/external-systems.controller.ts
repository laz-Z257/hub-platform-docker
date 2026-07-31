import { Request, Response } from "express";
import { env } from "../../config/env";
import { logger } from "../../lib/logger";

const MODULES: Record<string, string | undefined> = {
  traslados: env.EXTERNAL_SYSTEMS_URL,
};

export function redirectToModule(req: Request, res: Response): void {
  const param = req.params.module;
  const moduleName = Array.isArray(param) ? param[0] : param;
  const url = moduleName ? MODULES[moduleName] : undefined;

  if (!url) {
    res.status(404).json({ error: "Módulo externo no configurado" });
    return;
  }

  logger.info("Redirecting to external system", { module: moduleName });
  res.redirect(302, url);
}
