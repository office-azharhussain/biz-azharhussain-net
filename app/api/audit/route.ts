import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { audit } from '@/lib/logger'

const allowedLevels = new Set(['info', 'warn', 'error'])

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as { organizationId?: string; action?: string; message?: string; level?: string; metadata?: Record<string, unknown> } | null
  if (!body?.organizationId || !body.action || !body.message) return NextResponse.json({ error: 'organizationId, action, and message are required' }, { status: 400 })
  if (body.action.length > 120 || body.message.length > 500) return NextResponse.json({ error: 'Audit fields are too long' }, { status: 400 })
  if (body.level && !allowedLevels.has(body.level)) return NextResponse.json({ error: 'Invalid audit level' }, { status: 400 })

  const membership = await prisma.member.findFirst({ where: { organizationId: body.organizationId, userId: session.user.id }, select: { organizationId: true } })
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const persisted = await audit({
    action: body.action,
    message: body.message,
    level: (body.level as 'info' | 'warn' | 'error' | undefined) ?? 'info',
    userId: session.user.id,
    organizationId: membership.organizationId,
    metadata: body.metadata,
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    userAgent: request.headers.get('user-agent') ?? undefined,
  })

  if (!persisted) return NextResponse.json({ error: 'Audit event could not be persisted' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
