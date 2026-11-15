import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { audit } from '@/lib/logger'

export async function DELETE(request: Request) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as { memberId?: string } | null
  if (!body?.memberId) return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })

  const target = await prisma.member.findUnique({
    where: { id: body.memberId },
    include: { user: { select: { id: true, name: true, email: true } } },
  })
  if (!target || target.userId === session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const actor = await prisma.member.findUnique({
    where: { organizationId_userId: { organizationId: target.organizationId, userId: session.user.id } },
  })
  if (!actor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const permission = await auth.api.hasPermission({
    headers: requestHeaders,
    body: {
      organizationId: target.organizationId,
      permissions: { member: ['remove'] },
    },
  })
  if (!permission.success) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (target.role === 'owner' && actor.role !== 'owner') {
    return NextResponse.json({ error: 'Only an owner can remove another owner' }, { status: 403 })
  }

  try {
    await prisma.$transaction(async (transaction) => {
      const currentTarget = await transaction.member.findUnique({ where: { id: target.id } })
      if (!currentTarget || currentTarget.organizationId !== target.organizationId) throw new Error('MEMBER_NOT_FOUND')
      if (currentTarget.role === 'owner') {
        const ownerCount = await transaction.member.count({ where: { organizationId: target.organizationId, role: 'owner' } })
        if (ownerCount <= 1) throw new Error('LAST_OWNER')
      }
      await transaction.member.delete({ where: { id: currentTarget.id } })
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

  await audit({
    action: 'member.removed',
    message: `Removed ${target.user.name || target.user.email} from the organization`,
    userId: session.user.id,
    organizationId: target.organizationId,
    metadata: { targetUserId: target.user.id, previousRole: target.role },
  })
  return NextResponse.json({ ok: true })
}
