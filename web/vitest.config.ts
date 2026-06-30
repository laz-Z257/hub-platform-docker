import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@hub/shared": path.resolve(__dirname, "../shared/index.ts"),
      "@hub/shared/types": path.resolve(__dirname, "../shared/types"),
    },
  },
});
