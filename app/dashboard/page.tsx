import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ArrowUpRight, CheckCircle2, ChevronDown, ListChecks, Plus, ShieldCheck, Sparkles, Workflow } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { getEntraProfile } from '@/lib/entra-profile'
import { getProfileImageSource } from '@/lib/profile-image'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ organizationSlug?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const { organizationSlug } = (await searchParams) ?? {}
  const identityAccounts = await prisma.account.findMany({ where: { userId: session.user.id }, select: { providerId: true } })
  const isEmailPasswordUser = identityAccounts.some((account) => account.providerId === 'credential')
  let membership = organizationSlug
    ? await prisma.member.findFirst({ where: { userId: session.user.id, organization: { slug: organizationSlug } }, include: { organization: { include: { tenantDatabase: true } } } })
    : await prisma.member.findFirst({ where: { userId: session.user.id }, include: { organization: { include: { tenantDatabase: true } } }, orderBy: { createdAt: 'asc' } })

  if (!membership) {
    const organization = await prisma.organization.upsert({
      where: { slug: 'biz' },
      update: {},
      create: { id: crypto.randomUUID(), name: 'Biz', slug: 'biz', creatorId: session.user.id },
    })
    await prisma.member.upsert({
      where: { organizationId_userId: { organizationId: organization.id, userId: session.user.id } },
      update: {},
      create: { id: crypto.randomUUID(), organizationId: organization.id, userId: session.user.id, role: isEmailPasswordUser ? 'guest' : 'owner' },
    })
    membership = await prisma.member.findFirst({
      where: { userId: session.user.id },
      include: { organization: { include: { tenantDatabase: true } } },
      orderBy: { createdAt: 'asc' },
    })
  }

  if (!membership) redirect('/sign-in')
  const entraProfile = await getEntraProfile(session.user.id)
  const profileImageSrc = getProfileImageSource(session.user.id, session.user.image, identityAccounts.map((account) => account.providerId))
  const displayName = entraProfile?.displayName ?? session.user.name
  const firstName = displayName.split(' ')[0]
  const designation = entraProfile?.jobTitle?.trim() || 'Team member'
  const department = entraProfile?.department?.trim() || 'Biz'

  return (
    <DashboardLayout activePage="overview" displayName={displayName} designation={designation} department={department} profileImageSrc={profileImageSrc} canManageMembers={membership.role === 'owner' || membership.role === 'admin'}>
      <div className="mx-auto flex min-h-full w-full max-w-[1440px] flex-col gap-5">
        <div className="flex shrink-0 items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mint)]">AI operations center</p><h1 className="mt-2 font-display text-4xl leading-none tracking-wide sm:text-5xl">Good morning, {firstName}.</h1><p className="mt-2 text-sm text-[#71848a]">A focused view of your business operations.</p></div>
          <button className="hidden items-center gap-2 rounded-xl bg-[#087f68] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#087f68]/15 hover:bg-[#066b58] sm:inline-flex"><Plus className="size-4" />Create an agent</button>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard label="Active agents" value="24" change="18%" detail="this month" icon={Sparkles} />
          <StatCard label="Successful runs" value="96.8%" change="4.2%" detail="this month" icon={ShieldCheck} />
          <StatCard label="Needs review" value="18" change="6" detail="runs to check" icon={ListChecks} />
          <StatCard label="Automations live" value="42" change="3" detail="this month" icon={Workflow} />
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="flex min-h-0 flex-col rounded-2xl border border-[#dfe7e8] bg-white shadow-[0_8px_28px_rgba(24,55,64,0.035)] p-5">
            <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">Today&apos;s focus</h2><p className="mt-1 text-xs text-[#71848a]">The work that needs your attention.</p></div><button className="flex items-center gap-1.5 rounded-lg border border-[#e7eded] px-2.5 py-1.5 text-[11px] text-[#60747c]">Today <ChevronDown className="size-3" /></button></div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <FocusItem icon={ShieldCheck} title="Policy checks" detail="18 runs ready for review" status="Review" />
              <FocusItem icon={Workflow} title="Automations" detail="3 new workflows launched" status="Live" />
              <FocusItem icon={Sparkles} title="Agent performance" detail="96.8% successful runs" status="Healthy" />
              <FocusItem icon={CheckCircle2} title="Team activity" detail="All systems operational" status="Clear" />
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-[#e7eded] pt-4"><span className="text-xs text-[#71848a]">Last synced just now</span><Link href="/logs" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--mint)] hover:text-[#055c4b]">View activity <ArrowUpRight className="size-3.5" /></Link></div>
          </section>
          <section className="flex min-h-0 flex-col rounded-2xl border border-[#dfe7e8] bg-[#eaf6f2] p-5"><div className="flex items-center justify-between"><div className="flex size-9 items-center justify-center rounded-xl bg-white text-[#087f68]"><ShieldCheck className="size-4" /></div><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#087f68]">Healthy</span></div><h2 className="mt-5 font-display text-2xl tracking-wide text-[#203740]">Policy health</h2><p className="mt-2 text-xs leading-5 text-[#60747c]">Spend controls are working well across your organization.</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-white"><div className="h-full w-[86%] rounded-full bg-[#087f68]" /></div><div className="mt-2 flex justify-between text-[11px] text-[#60747c]"><span>86% compliant</span><span>12 of 14 policies</span></div><div className="mt-auto border-t border-[#d4e8e1] pt-4 text-xs text-[#536971]">No critical issues detected</div></section>
        </div>
      </div>
    </DashboardLayout>
  )
}

function FocusItem({ icon: Icon, title, detail, status }: { icon: typeof ShieldCheck; title: string; detail: string; status: string }) {
  return <article className="flex items-center gap-3 rounded-xl border border-[#e7eded] bg-[#f7f9f8] p-3"><div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--mint)]/10 text-[var(--mint)]"><Icon className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{title}</p><p className="mt-0.5 truncate text-[11px] text-[#71848a]">{detail}</p></div><span className="shrink-0 rounded-full bg-[var(--mint)]/10 px-2 py-1 text-[10px] font-semibold text-[var(--mint)]">{status}</span></article>
}

function StatCard({ label, value, change, detail, icon: Icon }: { label: string; value: string; change: string; detail: string; icon: typeof ShieldCheck }) {
  return <article className="rounded-2xl border border-[#dfe7e8] bg-white shadow-[0_8px_28px_rgba(24,55,64,0.035)] p-4"><div className="flex items-center justify-between"><p className="text-xs text-[#71848a]">{label}</p><Icon className="size-4 text-[var(--mint)]" /></div><p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-[#71848a]"><span className="flex items-center font-semibold text-[var(--mint)]"><ArrowUpRight className="size-3" />{change}</span>{detail}</p></article>
}
