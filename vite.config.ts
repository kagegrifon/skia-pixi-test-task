import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/skia-pixi-test-task/" : "/",
  test: {
    environment: "jsdom",
    globals: true,
    coverage: { provider: "v8" },
    setupFiles: ["./src/pixi/__tests__/setup.ts"],
  },
}));

