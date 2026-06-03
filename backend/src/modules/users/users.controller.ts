import { Request, Response } from "express";
import { db } from "../../db";
import { users } from "../../db/schema";

export async function listUsers(_req: Request, res: Response): Promise<void> {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        documento: users.documento,
        nombre: users.nombre,
        rol: users.rol,
        created_at: users.created_at,
      })
      .from(users);

    res.json(allUsers);
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ error: "Error al listar usuarios" });
  }
}
