import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { audit } from '@/lib/logger'

const roles = new Set(['owner', 'admin', 'member', 'guest'])

export async function PATCH(request: Request) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as { memberId?: string; role?: string } | null
  if (!body?.memberId || !body.role || !roles.has(body.role)) return NextResponse.json({ error: 'Invalid member role' }, { status: 400 })

  const target = await prisma.member.findUnique({
    where: { id: body.memberId },
    include: { user: { select: { name: true, email: true } } },
  })
  const actor = target
    ? await prisma.member.findUnique({ where: { organizationId_userId: { organizationId: target.organizationId, userId: session.user.id } } })
    : null
  if (!target || !actor || target.userId === session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const permission = await auth.api.hasPermission({
    headers: requestHeaders,
    body: {
      organizationId: target.organizationId,
      permissions: { member: ['changeRole'] },
    },
  })
  if (!permission.success) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (actor.role !== 'owner' && (target.role === 'owner' || body.role === 'owner')) {
    return NextResponse.json({ error: 'Only an owner can change an owner role' }, { status: 403 })
  }

  try {
    await prisma.$transaction(async (transaction) => {
      const currentTarget = await transaction.member.findUnique({ where: { id: target.id } })
      if (!currentTarget || currentTarget.organizationId !== target.organizationId) throw new Error('MEMBER_NOT_FOUND')
      if (currentTarget.role === 'owner' && body.role !== 'owner') {
        const ownerCount = await transaction.member.count({ where: { organizationId: target.organizationId, role: 'owner' } })
        if (ownerCount <= 1) throw new Error('LAST_OWNER')
      }
      await transaction.member.update({ where: { id: currentTarget.id }, data: { role: body.role } })
    }, { isolationLevel: 'Serializable' })
  } catch (error) {
    if (error instanceof Error && error.message === 'LAST_OWNER') {
      return NextResponse.json({ error: 'The organization needs at least one owner' }, { status: 409 })
    }
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2034') {
      return NextResponse.json({ error: 'The member list changed. Refresh and try again.' }, { status: 409 })
    }
    throw error
  }

  await audit({ action: 'member.role_changed', message: `Changed ${target.user.name || target.user.email}'s role to ${body.role}`, userId: session.user.id, organizationId: target.organizationId, metadata: { targetUserId: target.userId, role: body.role } })
  return NextResponse.json({ ok: true })
}
