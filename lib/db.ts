// lib/db.ts
import { PrismaClient } from "@prisma/client";

// Augment the global type so TS knows about our singleton handle.
declare global {
  // eslint-disable-next-line no-var
  var __db: PrismaClient | undefined;
}

export const db: PrismaClient = globalThis.__db ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db;
}
