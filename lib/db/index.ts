import { PrismaClient } from '@prisma/client'

function getDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? process.env.POSTGRES_URL

  if (!rawUrl && process.env.NEXT_PHASE === 'phase-production-build') {
    return 'postgresql://localhost:5432/chargeup'
  }
  if (!rawUrl) throw new Error('DATABASE_URL is not configured')

  const url = new URL(rawUrl)
  url.searchParams.delete('search_path')
  url.searchParams.delete('options')
  return url.toString()
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: getDatabaseUrl() })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
