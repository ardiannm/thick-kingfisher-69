import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["./src/tests/**/*.spec.{js,ts}"], // Adjust for your file extensions
    exclude: ["node_modules", "dist"], // Optional: exclude folders
  },
});
