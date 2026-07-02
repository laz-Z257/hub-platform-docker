import { Request, Response } from "express";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "../../db";
import { messages, incidents } from "../../db/schema";
import { logger } from "../../lib/logger";

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En Proceso",
  resuelto: "Resuelto",
};

interface SuggestedAction {
  label: string;
  action: string;
}

const PROBLEM_OPTIONS: SuggestedAction[] = [
  { label: "Problema con el sistema", action: "problema_sistema" },
  { label: "Problema de hardware", action: "problema_hardware" },
  { label: "Problema con punto de venta", action: "problema_pv" },
  { label: "Problema de acceso", action: "problema_acceso" },
  { label: "Consultar estado de reporte", action: "consultar_estado" },
  { label: "Preguntas frecuentes", action: "faq" },
  { label: "Reportar otro incidente", action: "reportar" },
];

const HELP_KEYWORDS = ["hola", "ayuda", "necesito", "problema", "tengo un", "quisiera", "puedes", "buenos dias", "buenas tardes", "buenas noches", "ayudame", "como", "que hago"];

const PROBLEM_RESPONSES: Record<string, { text: string; actions: SuggestedAction[] }> = {
  problema_sistema: {
    text: "Ha seleccionado problema con el sistema. Por favor reporte el incidente indicando los detalles del error y el modulo donde ocurre.",
    actions: [
      { label: "Reportar incidente", action: "reportar" },
      { label: "Volver al menu", action: "menu_principal" },
    ],
  },
  problema_hardware: {
    text: "Para problemas de hardware, reporte el incidente indicando el equipo afectado y la descripcion de la falla.",
    actions: [
      { label: "Reportar incidente", action: "reportar" },
      { label: "Volver al menu", action: "menu_principal" },
    ],
  },
  problema_pv: {
    text: "Describa el problema con su punto de venta para que sea reportado al area correspondiente.",
    actions: [
      { label: "Reportar incidente", action: "reportar" },
      { label: "Volver al menu", action: "menu_principal" },
    ],
  },
  problema_acceso: {
    text: "Si tiene problemas para acceder al sistema, verifique su usuario y contrasena. Si el problema persiste, reportelo para restablecer su acceso.",
    actions: [
      { label: "Reportar incidente", action: "reportar" },
      { label: "Volver al menu", action: "menu_principal" },
    ],
  },
  consultar_estado: {
    text: "Puede consultar el estado de sus reportes en la seccion Historial de la aplicacion. Alli aparecen todos sus incidentes con su estado actual.",
    actions: [
      { label: "Ir a historial", action: "ir_historial" },
      { label: "Volver al menu", action: "menu_principal" },
    ],
  },
  faq: {
    text: "Seleccione Ver preguntas frecuentes para consultar las dudas mas comunes. Si no encuentra lo que busca, puede reportar un incidente.",
    actions: [
      { label: "Ver preguntas frecuentes", action: "ver_faq" },
      { label: "Reportar incidente", action: "reportar" },
      { label: "Volver al menu", action: "menu_principal" },
    ],
  },
  reportar: {
    text: "Será redirigido al formulario de reporte para que ingrese los detalles del incidente.",
    actions: [
      { label: "Ir a reportar", action: "reportar" },
      { label: "Volver al menu", action: "menu_principal" },
    ],
  },
  menu_principal: {
    text: "Seleccione una opcion:",
    actions: [...PROBLEM_OPTIONS],
  },
};

function detectIntent(text: string): { text: string; actions: SuggestedAction[] } | null {
  const lower = text.toLowerCase().trim();

  if (PROBLEM_RESPONSES[lower]) {
    return PROBLEM_RESPONSES[lower];
  }

  const labelMatch = PROBLEM_OPTIONS.find(
    (opt) => opt.label.toLowerCase().startsWith(lower) || lower.includes(opt.action)
  );
  if (labelMatch && PROBLEM_RESPONSES[labelMatch.action]) {
    return PROBLEM_RESPONSES[labelMatch.action];
  }

  const REPORT_KEYWORDS = ["reportar", "reporte", "incidente", "quiero reportar"];
  if (REPORT_KEYWORDS.some((kw) => lower.includes(kw))) {
    return PROBLEM_RESPONSES.reportar;
  }

  const HISTORY_KEYWORDS = ["historial", "mis reportes", "mis tickets", "estado de"];
  if (HISTORY_KEYWORDS.some((kw) => lower.includes(kw))) {
    return PROBLEM_RESPONSES.consultar_estado;
  }

  const isHelpRequest = HELP_KEYWORDS.some((kw) => lower.includes(kw));
  if (isHelpRequest) {
    return {
      text: "Bienvenido al asistente de soporte. Seleccione el tipo de problema que necesita reportar:",
      actions: [...PROBLEM_OPTIONS],
    };
  }

  return null;
}

function getDefaultResponse(): { text: string; actions: SuggestedAction[] } {
  return {
    text: "Su mensaje ha sido registrado. Un agente revisara su consulta y le respondera pronto.",
    actions: [
      { label: "Volver al menu principal", action: "menu_principal" },
      { label: "Reportar incidente", action: "reportar" },
    ],
  };
}

async function lookupTicket(
  userId: string,
  text: string
): Promise<{ text: string; actions: SuggestedAction[] } | null> {
  const match = text.match(/(?:#?TK-)?([A-Fa-f0-9]{4,8})/);
  if (!match) return null;

  const shortId = match[1].toUpperCase();

  const [incident] = await db
    .select({
      id: incidents.id,
      descripcion: incidents.descripcion,
      estado: incidents.estado,
      created_at: incidents.created_at,
    })
    .from(incidents)
    .where(
      and(
        eq(incidents.user_id, userId),
        sql`UPPER(RIGHT(REPLACE(${incidents.id}::text, '-', ''), 8)) LIKE ${'%' + shortId}`
      )
    )
    .limit(1);

  if (!incident) return null;

  const estado = ESTADO_LABELS[incident.estado] || incident.estado;
  const fecha = new Date(incident.created_at).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  });

  return {
    text:
      `Ticket #TK-${shortId}\n\n` +
      `${incident.descripcion.slice(0, 80)}${incident.descripcion.length > 80 ? "..." : ""}\n` +
      `Creado el ${fecha}\n` +
      `Estado: ${estado}`,
    actions: [
      { label: "Volver al menu principal", action: "menu_principal" },
    ],
  };
}

export async function sendMessage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { content } = req.body;

    const [userMsg] = await db
      .insert(messages)
      .values({
        user_id: req.user!.userId,
        content,
        is_bot: false,
      })
      .returning();

    const ticketInfo = await lookupTicket(req.user!.userId, content);
    const intentInfo = !ticketInfo ? detectIntent(content) : null;
    const response = ticketInfo || intentInfo || getDefaultResponse();

    const [botMsg] = await db
      .insert(messages)
      .values({
        user_id: req.user!.userId,
        content: response.text,
        is_bot: true,
      })
      .returning();

    res.json({
      userMessage: userMsg,
      botMessage: botMsg,
      suggestedActions: response.actions,
    });
  } catch (error) {
    logger.error("Send message error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
}

export async function getHistory(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const limit = (req.validatedQuery?.limit as number) || parseInt(req.query.limit as string) || 50;

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.user_id, req.user!.userId))
      .orderBy(desc(messages.created_at))
      .limit(limit);

    res.json(history.reverse());
  } catch (error) {
    logger.error("Get history error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al obtener historial" });
  }
}
