import winston from 'winston'
import { prisma } from '@/lib/db'

const { combine, timestamp, errors, json, colorize, simple } = winston.format

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: 'chargeup' },
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? combine(timestamp(), errors({ stack: true }), json()) : combine(colorize(), simple()),
    }),
  ],
})

export type AuditEvent = {
  action: string
  message: string
  level?: 'info' | 'warn' | 'error'
  userId?: string
  organizationId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}

export async function audit(event: AuditEvent): Promise<boolean> {
  const level = event.level ?? 'info'
  logger.log(level, event.message, {
    action: event.action,
    userId: event.userId,
    organizationId: event.organizationId,
    metadata: event.metadata,
  })

  try {
    await prisma.auditLog.create({
      data: {
        action: event.action,
        level,
        message: event.message,
        userId: event.userId,
        organizationId: event.organizationId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: event.metadata ? JSON.stringify(event.metadata) : undefined,
      },
    })
    return true
  } catch (error) {
    logger.error('Failed to persist audit log', { action: event.action, error })
    return false
  }
}
