/* This TypeScript code snippet is setting up a database connection using PrismaClient. Here's a
breakdown of what each part of the code is doing: */
import { PrismaClient } from '../prisma/output';

/* eslint-disable no-var */
declare global {
  var prisma: PrismaClient | undefined;
}
/* eslint-enable no-var */

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
