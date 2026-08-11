// prisma.config.js — Prisma v7 Configuration
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load .env.local if present, otherwise process.env is used directly (e.g. Netlify CI)
dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  earlyAccess: true,
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/db",
  },
});
