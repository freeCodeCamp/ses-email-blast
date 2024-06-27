import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html"],
      all: true,
      allowExternal: true,
      exclude: ["prod", ...configDefaults.exclude]
    }
  }
});
