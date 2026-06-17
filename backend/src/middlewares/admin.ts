import { Request, Response, NextFunction } from "express";

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || (req.user.rol !== "admin" && req.user.rol !== "tecnico")) {
    res.status(403).json({ error: "Acceso denegado. Se requiere rol admin." });
    return;
  }

  next();
}
