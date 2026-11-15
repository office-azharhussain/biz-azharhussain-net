import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { audit } from '@/lib/logger'

const roles = new Set(['owner', 'member', 'guest'])

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null) as { memberId?: string; role?: string } | null
  if (!body?.memberId || !body.role || !roles.has(body.role)) return NextResponse.json({ error: 'Invalid member role' }, { status: 400 })

  const target = await prisma.member.findUnique({ where: { id: body.memberId }, include: { organization: true, user: { select: { name: true, email: true } } } })
  const actor = target ? await prisma.member.findUnique({ where: { organizationId_userId: { organizationId: target.organizationId, userId: session.user.id } } }) : null
  if (!target || !actor || !['owner', 'admin'].includes(actor.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (target.role === 'owner' && body.role !== 'owner') {
    const ownerCount = await prisma.member.count({ where: { organizationId: target.organizationId, role: 'owner' } })
    if (ownerCount <= 1) return NextResponse.json({ error: 'The organization needs at least one owner' }, { status: 409 })
  }

  await prisma.member.update({ where: { id: target.id }, data: { role: body.role } })
  await audit({ action: 'member.role_changed', message: `Changed ${target.user.name || target.user.email}'s role to ${body.role}`, userId: session.user.id, organizationId: target.organizationId, metadata: { targetUserId: target.userId, role: body.role } })
  return NextResponse.json({ ok: true })
}
