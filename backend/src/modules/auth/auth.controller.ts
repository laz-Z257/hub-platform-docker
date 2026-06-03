import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import { signToken } from "../../lib/jwt";

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { documento, contrasena } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.documento, documento))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Documento o contraseña incorrectos" });
      return;
    }

    const valid = await bcrypt.compare(contrasena, user.contrasena);

    if (!valid) {
      res.status(401).json({ error: "Documento o contraseña incorrectos" });
      return;
    }

    const token = signToken({
      userId: user.id,
      documento: user.documento,
      rol: user.rol,
    });

    res.json({
      token,
      user: {
        id: user.id,
        documento: user.documento,
        nombre: user.nombre,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  try {
    const [user] = await db
      .select({
        id: users.id,
        documento: users.documento,
        nombre: users.nombre,
        rol: users.rol,
        created_at: users.created_at,
      })
      .from(users)
      .where(eq(users.id, req.user!.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
