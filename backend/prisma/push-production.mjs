// Applies schema.prisma to the production schema: `npm run db:push:prod`.
// Uses PRODUCTION_DATABASE_URL from .env — the DATABASE_URL Vercel runs with.
import { spawnSync } from "node:child_process";

const url = process.env.PRODUCTION_DATABASE_URL;
if (!url) {
  console.error("Set PRODUCTION_DATABASE_URL in backend/.env (the DATABASE_URL you gave Vercel).");
  process.exit(1);
}
const { status } = spawnSync("npx", ["prisma", "db", "push", "--skip-generate"], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: url },
});
process.exit(status ?? 1);
