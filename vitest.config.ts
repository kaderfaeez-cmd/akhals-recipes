import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit and route-handler tests. Route handlers import through the `@/` alias and pull in
// next-auth, next/cache and Prisma, which the tests replace with vi.mock — that is why this repo
// uses Vitest rather than plain `node --test`. No test may reach a real database.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "prisma/**/*.test.ts"],
    // A stray DATABASE_URL in the shell must never point a test at a real database.
    env: { DATABASE_URL: "" },
  },
});
