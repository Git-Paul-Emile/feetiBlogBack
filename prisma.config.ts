import "dotenv/config";
import { defineConfig } from "prisma/config";

const buildDatabaseUrl = "postgresql://build-placeholder/db?schema=feeti_blog";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: process.env.DATABASE_URL ?? buildDatabaseUrl,
    directUrl: process.env.DIRECT_URL ?? buildDatabaseUrl,
  },
});
