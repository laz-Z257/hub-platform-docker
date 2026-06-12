import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq, ne, and, sql, ilike, or } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { documento, nombre, contrasena, rol } = req.body;

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.documento, documento))
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "El documento ya está registrado" });
      return;
    }

    const hashed = await bcrypt.hash(contrasena, 10);

    const [user] = await db
      .insert(users)
      .values({
        documento,
        nombre,
        contrasena: hashed,
        email: `${documento}@hub.ai`,
        rol: rol || "user",
      })
      .returning();

    res.status(201).json({
      id: user.id,
      documento: user.documento,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      estado: user.estado,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    const q = req.validatedQuery!;
    const page = q.page as number;
    const limit = q.limit as number;
    const offset = (page - 1) * limit;
    const search = q.search as string | undefined;
    const rol = q.rol as string | undefined;

    const conditions: ReturnType<typeof eq>[] = [];

    if (rol) {
      conditions.push(eq(users.rol, rol as "admin" | "user"));
    } else {
      conditions.push(ne(users.rol, "admin") as ReturnType<typeof eq>);
    }

    if (search) {
      conditions.push(
        or(
          ilike(users.nombre, `%${search}%`),
          ilike(users.documento, `%${search}%`),
          ilike(users.email, `%${search}%`)
        ) as ReturnType<typeof eq>
      );
    }

    const whereClause = and(...conditions);

    const totalResult = await db.$count(users, whereClause);

    const items = await db
      .select({
        id: users.id,
        documento: users.documento,
        nombre: users.nombre,
        email: users.email,
        rol: users.rol,
        estado: users.estado,
        ultima_actividad: users.ultima_actividad,
        created_at: users.created_at,
      })
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    res.json({
      items,
      total: totalResult,
      page,
      limit,
      totalPages: Math.ceil(totalResult / limit),
    });
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ error: "Error al listar usuarios" });
  }
}

export async function toggleUserStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params as { id: string };

    const [user] = await db
      .select({ id: users.id, estado: users.estado, rol: users.rol })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    if (user.rol === "admin") {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    const newEstado = user.estado === "activo" ? "bloqueado" : "activo";

    const [updated] = await db
      .update(users)
      .set({ estado: newEstado })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        nombre: users.nombre,
        rol: users.rol,
        estado: users.estado,
      });

    res.json(updated);
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ error: "Error al cambiar estado del usuario" });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { contrasena } = req.body;

    const hashed = await bcrypt.hash(contrasena, 10);

    const [updated] = await db
      .update(users)
      .set({
        contrasena: hashed,
        intentos_fallidos: 0,
        estado: "activo",
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        documento: users.documento,
        nombre: users.nombre,
        rol: users.rol,
        estado: users.estado,
      });

    if (!updated) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json({ message: "Contraseña restablecida exitosamente", user: updated });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const { rol, nombre, email } = req.body;

    if (rol !== undefined && rol !== "admin") {
      const [targetUser] = await db
        .select({ rol: users.rol })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (targetUser && targetUser.rol === "admin") {
        const [count] = await db
          .select({ total: sql<number>`count(*)`.mapWith(Number) })
          .from(users)
          .where(and(eq(users.rol, "admin"), ne(users.id, id)));

        if (count.total === 0) {
          res.status(403).json({ error: "No se puede degradar al único administrador" });
          return;
        }
      }
    }

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
