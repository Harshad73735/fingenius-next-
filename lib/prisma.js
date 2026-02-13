// import { PrismaClient } from "@prisma/client";

// export const db=globalThis.prisma || new PrismaClient();

// if(process.env.NODE_ENV!=="production"){
//     globalThis.prisma=db;
// }

// lib/prisma.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],

    // 👇 IMPORTANT: disable prepared statements for Supabase pooled connections
    datasources: {
      db: {
        url: process.env.DATABASE_URL + "?pgbouncer=true&connection_limit=1",
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
