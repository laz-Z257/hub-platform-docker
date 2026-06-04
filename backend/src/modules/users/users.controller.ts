import { Request, Response } from "express";
import { eq, ne } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";

export async function listUsers(_req: Request, res: Response): Promise<void> {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        documento: users.documento,
        nombre: users.nombre,
        email: users.email,
        rol: users.rol,
        created_at: users.created_at,
      })
      .from(users)
      .where(ne(users.rol, "admin"));

    res.json(allUsers);
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ error: "Error al listar usuarios" });
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { rol, nombre, email } = req.body;

    const updateData: Record<string, unknown> = {};
    if (rol !== undefined) updateData.rol = rol;
    if (nombre !== undefined) updateData.nombre = nombre;
    if (email !== undefined) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No hay campos para actualizar" });
      return;
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        documento: users.documento,
        nombre: users.nombre,
        email: users.email,
        rol: users.rol,
        created_at: users.created_at,
      });

    if (!updated) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
}
