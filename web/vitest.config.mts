import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Résout l'alias @/* depuis tsconfig.json, nativement.
    tsconfigPaths: true,
    alias: {
      // `import "server-only"` plante volontairement hors du runtime Next.js
      // (voir src/test/server-only-shim.ts) — sans cet alias, aucun module
      // server/ ne serait testable sous Vitest.
      "server-only": path.resolve(import.meta.dirname, "src/test/server-only-shim.ts"),
    },
  },
  test: {
    // Le domaine et le protocole UCI sont du TypeScript pur : pas besoin de DOM.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
