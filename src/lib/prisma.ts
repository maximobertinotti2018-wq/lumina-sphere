import { PrismaClient } from '@prisma/client';

/**
 * ========================================
 * PRISMA CLIENT SINGLETON
 * ========================================
 * Singleton pattern para evitar múltiples instancias.
 * 
 * En desarrollo, Next.js hot reload puede crear
 * múltiples instancias. Este patrón lo previene.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
