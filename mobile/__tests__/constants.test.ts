import { URGENCIA_COLORS, ESTADO_LABELS, ESTADO_COLORS, COLORS } from "../src/constants/colors";

describe("Color Constants", () => {
  describe("URGENCIA_COLORS", () => {
    it("should have correct colors for all urgency levels", () => {
      expect(URGENCIA_COLORS.alta).toBe("#EF4444");
      expect(URGENCIA_COLORS.media).toBe("#F59E0B");
      expect(URGENCIA_COLORS.baja).toBe("#22C55E");
    });

    it("should have exactly 3 urgency levels", () => {
      expect(Object.keys(URGENCIA_COLORS)).toHaveLength(3);
    });
  });

  describe("ESTADO_LABELS", () => {
    it("should have correct labels for all states", () => {
      expect(ESTADO_LABELS.pendiente).toBe("Pendiente");
      expect(ESTADO_LABELS.en_proceso).toBe("En Proceso");
      expect(ESTADO_LABELS.resuelto).toBe("Resuelto");
    });

    it("should have exactly 3 states", () => {
      expect(Object.keys(ESTADO_LABELS)).toHaveLength(3);
    });
  });

  describe("ESTADO_COLORS", () => {
    it("should have correct colors for all states", () => {
      expect(ESTADO_COLORS.pendiente).toBe("#3B82F6");
      expect(ESTADO_COLORS.en_proceso).toBe("#F59E0B");
      expect(ESTADO_COLORS.resuelto).toBe("#22C55E");
    });

    it("should use consistent color for en_proceso and media urgency", () => {
      expect(ESTADO_COLORS.en_proceso).toBe(URGENCIA_COLORS.media);
    });
  });

  describe("COLORS", () => {
    it("should have primary brand color", () => {
      expect(COLORS.primary).toBe("#201A7A");
    });

    it("should have all required color properties", () => {
      expect(COLORS).toHaveProperty("primary");
      expect(COLORS).toHaveProperty("primaryLight");
      expect(COLORS).toHaveProperty("textDark");
      expect(COLORS).toHaveProperty("background");
      expect(COLORS).toHaveProperty("error");
      expect(COLORS).toHaveProperty("success");
      expect(COLORS).toHaveProperty("warning");
    });

    it("should have valid hex color format", () => {
      const hexRegex = /^#[0-9A-F]{6}$/i;
      Object.values(COLORS).forEach((color) => {
        expect(color).toMatch(hexRegex);
      });
    });
  });
});