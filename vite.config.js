import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    exclude: ["tests/e2e/**"],
    setupFiles: "./src/test/setup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: ["src/{hooks,services,utils}/**/*.{js,jsx}"],
      exclude: ["src/main.jsx", "src/test/**"],
      thresholds: {
        statements: 30,
        branches: 25,
        functions: 35,
        lines: 30,
      },
    },
  },
});
