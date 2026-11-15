import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { audit } from '@/lib/logger'
import { getEntraAccessToken } from '@/lib/entra-profile'
import { sendGraphInvitationEmail } from '@/lib/graph-mail'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null) as { organizationId?: string; email?: string } | null
  const email = body?.email?.trim().toLowerCase()
  if (!body?.organizationId || !email || !email.includes('@') || email.length > 320) return NextResponse.json({ error: 'Enter a valid guest email address' }, { status: 400 })

  const membership = await prisma.member.findUnique({ where: { organizationId_userId: { organizationId: body.organizationId, userId: session.user.id } }, include: { organization: true } })
  if (!membership || !['owner', 'admin'].includes(membership.role)) return NextResponse.json({ error: 'Only organization owners and admins can invite guests' }, { status: 403 })

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (existingUser) {
    const existingMember = await prisma.member.findUnique({ where: { organizationId_userId: { organizationId: membership.organizationId, userId: existingUser.id } } })
    if (existingMember) return NextResponse.json({ error: 'This user is already a member of the organization' }, { status: 409 })
  }

  const invitation = await prisma.invitation.create({
    data: { id: crypto.randomUUID(), organizationId: membership.organizationId, email, role: 'guest', status: 'pending', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), inviterId: session.user.id },
  })
  const baseUrl = process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const inviteUrl = `${baseUrl.replace(/\/$/, '')}/organization/accept-invitation?id=${encodeURIComponent(invitation.id)}`
  const accessToken = await getEntraAccessToken(session.user.id)
  const mailResult = accessToken ? await sendGraphInvitationEmail({ accessToken, to: email, organizationName: membership.organization.name, inviteUrl }) : { sent: false as const, status: 401, detail: 'Microsoft Graph Mail.Send permission is required.' }
  const emailSent = mailResult.sent

  await audit({ action: 'organization.guest_invited', message: `Invited ${email} as a guest`, userId: session.user.id, organizationId: membership.organizationId, metadata: { invitationId: invitation.id, email, role: 'guest', emailSent, mailProvider: 'microsoft-graph' } })
  return NextResponse.json({ ok: true, emailSent, inviteUrl, message: emailSent ? 'Invitation email sent through Microsoft Graph.' : 'Invitation created. Re-authenticate with Microsoft and grant Mail.Send, or copy the invite link to share it.' })
}
