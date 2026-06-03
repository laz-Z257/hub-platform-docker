import type { Incident, User, KpiData } from "./types";

export const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@hub.ai",
    name: "Admin Hub",
    role: "admin",
  },
  {
    id: "2",
    email: "agente@hub.ai",
    name: "Carlos Agente",
    role: "agent",
  },
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "INC-001",
    nombre: "Juan Pérez",
    documento: "12345678",
    puntoVenta: "Centro Comercial Plaza",
    telefono: "3001234567",
    descripcion: "El terminal de pago no responde al pasar tarjetas.",
    urgencia: "alta",
    estado: "pendiente",
    fecha: "2026-06-03T09:30:00Z",
    comentarios: [],
  },
  {
    id: "INC-002",
    nombre: "María Gómez",
    documento: "87654321",
    puntoVenta: "Aeropuerto Terminal 2",
    telefono: "3009876543",
    descripcion: "La impresora fiscal no emite comprobantes.",
    urgencia: "alta",
    estado: "en_proceso",
    fecha: "2026-06-03T08:15:00Z",
    agente: "Carlos Agente",
    comentarios: [
      {
        autor: "Carlos Agente",
        texto: "Revisando el firmware de la impresora.",
        fecha: "2026-06-03T08:45:00Z",
      },
    ],
  },
  {
    id: "INC-003",
    nombre: "Luis Torres",
    documento: "45678912",
    puntoVenta: "Sucursal Norte",
    telefono: "3104567890",
    descripcion: "El sistema de inventario muestra datos desactualizados.",
    urgencia: "media",
    estado: "resuelto",
    fecha: "2026-06-02T14:20:00Z",
    agente: "Carlos Agente",
    comentarios: [
      {
        autor: "Carlos Agente",
        texto: "Se sincronizó la base de datos manualmente. Todo OK.",
        fecha: "2026-06-02T15:10:00Z",
      },
    ],
  },
  {
    id: "INC-004",
    nombre: "Ana Martínez",
    documento: "78912345",
    puntoVenta: "Centro Comercial Plaza",
    telefono: "3157891234",
    descripcion: "Pantalla del POS se congela al abrir ciertas opciones.",
    urgencia: "alta",
    estado: "en_proceso",
    fecha: "2026-06-02T11:00:00Z",
    agente: "Carlos Agente",
    comentarios: [],
  },
  {
    id: "INC-005",
    nombre: "Pedro Sánchez",
    documento: "32165498",
    puntoVenta: "Sucursal Sur",
    telefono: "3203216549",
    descripcion: "No se puede iniciar sesión en el sistema.",
    urgencia: "alta",
    estado: "pendiente",
    fecha: "2026-06-02T10:45:00Z",
    comentarios: [],
  },
  {
    id: "INC-006",
    nombre: "Carlos Ruiz",
    documento: "65498732",
    puntoVenta: "Aeropuerto Terminal 1",
    telefono: "3006549873",
    descripcion: "Lecto de código de barras muy lento.",
    urgencia: "baja",
    estado: "resuelto",
    fecha: "2026-06-01T16:30:00Z",
    agente: "Carlos Agente",
    comentarios: [
      {
        autor: "Carlos Agente",
        texto: "Se limpió el sensor y recalibró la sensibilidad.",
        fecha: "2026-06-01T17:00:00Z",
      },
    ],
  },
  {
    id: "INC-007",
    nombre: "Diana López",
    documento: "98732145",
    puntoVenta: "Sucursal Norte",
    telefono: "3109873214",
    descripcion: "Problemas con la sincronización de turnos en nómina.",
    urgencia: "media",
    estado: "en_proceso",
    fecha: "2026-06-01T14:00:00Z",
    agente: "Carlos Agente",
    comentarios: [],
  },
  {
    id: "INC-008",
    nombre: "Roberto Díaz",
    documento: "74185296",
    puntoVenta: "Centro Comercial Plaza",
    telefono: "3157418529",
    descripcion: "Impresora de recibos no corta el papel correctamente.",
    urgencia: "media",
    estado: "pendiente",
    fecha: "2026-06-01T09:15:00Z",
    comentarios: [],
  },
  {
    id: "INC-009",
    nombre: "Sofía Vargas",
    documento: "85296374",
    puntoVenta: "Sucursal Este",
    telefono: "3208529637",
    descripcion: "Conexión intermitente con el servidor principal.",
    urgencia: "alta",
    estado: "resuelto",
    fecha: "2026-05-31T11:30:00Z",
    agente: "Carlos Agente",
    comentarios: [
      {
        autor: "Carlos Agente",
        texto: "Se reinició el switch de red. Conexión estable.",
        fecha: "2026-05-31T12:00:00Z",
      },
    ],
  },
  {
    id: "INC-010",
    nombre: "Miguel Ángel Ríos",
    documento: "96385274",
    puntoVenta: "Aeropuerto Terminal 2",
    telefono: "3009638527",
    descripcion: "El datáfono marca error 404 al procesar pagos.",
    urgencia: "alta",
    estado: "en_proceso",
    fecha: "2026-05-31T10:00:00Z",
    agente: "Carlos Agente",
    comentarios: [],
  },
  {
    id: "INC-011",
    nombre: "Laura Jiménez",
    documento: "14725836",
    puntoVenta: "Sucursal Sur",
    telefono: "3151472583",
    descripcion: "Actualización del software no se completa.",
    urgencia: "baja",
    estado: "pendiente",
    fecha: "2026-05-30T15:45:00Z",
    comentarios: [],
  },
  {
    id: "INC-012",
    nombre: "Fernando Castillo",
    documento: "25836914",
    puntoVenta: "Centro Comercial Plaza",
    telefono: "3102583691",
    descripcion: "Teclado numérico no registra algunas teclas.",
    urgencia: "media",
    estado: "resuelto",
    fecha: "2026-05-30T13:20:00Z",
    agente: "Carlos Agente",
    comentarios: [
      {
        autor: "Carlos Agente",
        texto: "Se reemplazó el teclado. Incidente cerrado.",
        fecha: "2026-05-30T14:30:00Z",
      },
    ],
  },
  {
    id: "INC-013",
    nombre: "Carmen Ortega",
    documento: "36914725",
    puntoVenta: "Aeropuerto Terminal 1",
    telefono: "3203691472",
    descripcion: "Monitor secundario muestra líneas verticales.",
    urgencia: "baja",
    estado: "resuelto",
    fecha: "2026-05-29T16:00:00Z",
    agente: "Carlos Agente",
    comentarios: [
      {
        autor: "Carlos Agente",
        texto: "Se cambió cable VGA. Funcionando correctamente.",
        fecha: "2026-05-29T16:45:00Z",
      },
    ],
  },
  {
    id: "INC-014",
    nombre: "Jorge Méndez",
    documento: "15975346",
    puntoVenta: "Sucursal Norte",
    telefono: "3001597534",
    descripcion: "Software de nómina genera cálculos incorrectos.",
    urgencia: "alta",
    estado: "en_proceso",
    fecha: "2026-05-29T09:00:00Z",
    agente: "Carlos Agente",
    comentarios: [],
  },
  {
    id: "INC-015",
    nombre: "Patricia Herrera",
    documento: "75315948",
    puntoVenta: "Sucursal Este",
    telefono: "3157531594",
    descripcion: "El sistema se reinicia aleatoriamente durante el día.",
    urgencia: "alta",
    estado: "pendiente",
    fecha: "2026-05-28T12:30:00Z",
    comentarios: [],
  },
];

export function getKpiData(incidents: Incident[]): KpiData {
  return {
    total: incidents.length,
    pendientes: incidents.filter((i) => i.estado === "pendiente").length,
    enProceso: incidents.filter((i) => i.estado === "en_proceso").length,
    resueltos: incidents.filter((i) => i.estado === "resuelto").length,
    altaUrgencia: incidents.filter((i) => i.urgencia === "alta").length,
  };
}

export function getChartData(incidents: Incident[]) {
  const urgenciaData = [
    {
      name: "Alta",
      value: incidents.filter((i) => i.urgencia === "alta").length,
      color: "#EF4444",
    },
    {
      name: "Media",
      value: incidents.filter((i) => i.urgencia === "media").length,
      color: "#F59E0B",
    },
    {
      name: "Baja",
      value: incidents.filter((i) => i.urgencia === "baja").length,
      color: "#22C55E",
    },
  ];

  const monthlyData = [
    { name: "Ene", total: 8 },
    { name: "Feb", total: 12 },
    { name: "Mar", total: 9 },
    { name: "Abr", total: 15 },
    { name: "May", total: 18 },
    { name: "Jun", total: 15 },
  ];

  const statusData = [
    {
      name: "Pendientes",
      value: incidents.filter((i) => i.estado === "pendiente").length,
      color: "#F59E0B",
    },
    {
      name: "En Proceso",
      value: incidents.filter((i) => i.estado === "en_proceso").length,
      color: "#3B82F6",
    },
    {
      name: "Resueltos",
      value: incidents.filter((i) => i.estado === "resuelto").length,
      color: "#22C55E",
    },
  ];

  return { urgenciaData, monthlyData, statusData };
}

export const VALID_CREDENTIALS = {
  documento: "123456789",
  contrasena: "admin123",
};
