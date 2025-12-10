// lib/prisma.ts (or wherever your singleton is located)

// 1. IMPORT CHANGE: Import from the new generated path, not '@prisma/client'
import { PrismaClient } from '@/prisma/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Set up the connection and adapter outside the singleton logic
const connectionString = process.env.DATABASE_URL;

// Ensure connectionString exists before creating the pool/adapter
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// 2. ADAPTER CREATION: Use the 'pg' driver to create a connection pool
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// The global object remains the same to handle Next.js hot-reloads
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 3. INSTANTIATION CHANGE: Pass the adapter to the new PrismaClient constructor
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
