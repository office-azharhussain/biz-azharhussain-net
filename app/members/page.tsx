import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { MemberTable, type MemberRow } from '@/components/member-table'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getEntraProfile } from '@/lib/entra-profile'
import { getProfileImageSource } from '@/lib/profile-image'

export default async function MembersPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const membership = await prisma.member.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!membership) redirect('/dashboard')

  const members = await prisma.member.findMany({
    where: { organizationId: membership.organizationId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          accounts: {
            where: { providerId: { in: ['chargeup-microsoft', 'microsoft'] } },
            select: { providerId: true },
          },
        },
      },
    },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  })

  const rows: MemberRow[] = await Promise.all(members.map(async (member) => {
    const entraProfile = await getEntraProfile(member.user.id)
    return {
      id: member.id,
      userId: member.user.id,
      name: entraProfile?.displayName ?? member.user.name,
      email: entraProfile?.mail ?? entraProfile?.userPrincipalName ?? member.user.email,
      image: getProfileImageSource(member.user.id, member.user.image, member.user.accounts.map((account) => account.providerId)),
      designation: entraProfile?.jobTitle?.trim() || 'Team member',
      department: entraProfile?.department?.trim() || 'Not provided',
      role: normalizeRole(member.role),
      source: member.user.accounts.some((account) => ['chargeup-microsoft', 'microsoft'].includes(account.providerId)) ? 'Microsoft 365' : 'Email',
      joinedAt: member.createdAt.toISOString(),
    }
  }))

  const currentMember = rows.find((member) => member.userId === session.user.id)

  return (
    <DashboardLayout
      activePage="members"
      displayName={currentMember?.name ?? session.user.name}
      designation={currentMember?.designation ?? 'Team member'}
      department={currentMember?.department ?? 'ChargeUp AI Lab'}
      profileImageSrc={currentMember?.image ?? null}
      canManageMembers={membership.role === 'owner' || membership.role === 'admin'}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-28 pt-3">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mint)]"><Users className="size-3.5" />Organization</p>
            <h1 className="mt-3 font-display text-5xl tracking-wide">Members</h1>
            <p className="mt-3 text-sm text-white/45">Manage access for {membership.organization.name}.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#101c27] px-4 py-3 text-sm text-white/45"><span className="font-semibold text-white">{rows.length}</span> members</div>
        </div>
        <MemberTable members={rows} currentUserId={session.user.id} organizationId={membership.organizationId} canManage={membership.role === 'owner' || membership.role === 'admin'} />
      </div>
    </DashboardLayout>
  )
}

function normalizeRole(role: string): MemberRow['role'] {
  return role === 'owner' || role === 'guest' ? role : 'member'
}
