import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Activity, ArrowLeft, CheckCircle2, CircleAlert, Info, XCircle } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const levelStyles = {
  info: { icon: Info, className: 'bg-[#74dec3]/10 text-[#74dec3]' },
  warn: { icon: CircleAlert, className: 'bg-amber-300/10 text-amber-300' },
  error: { icon: XCircle, className: 'bg-red-300/10 text-red-300' },
} as const

export default async function LogsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const membership = await prisma.member.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
    orderBy: { createdAt: 'asc' },
  })
  if (!membership) redirect('/dashboard')

  const logs = await prisma.auditLog.findMany({
    where: { organizationId: membership.organizationId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <main className="min-h-[100svh] bg-[var(--ink-950)] text-white [color-scheme:dark]">
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#101c27] px-5 sm:px-8">
        <Link href="/dashboard" className="flex items-center gap-3" aria-label="Back to dashboard"><BrandLogo size={32} /><span className="font-display text-xl tracking-wide">ChargeUp AI Lab</span></Link>
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"><ArrowLeft className="size-3.5" />Dashboard</Link>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mint)]"><Activity className="size-3.5" />Governance</p><h1 className="mt-3 font-display text-5xl tracking-wide">Audit logs</h1><p className="mt-3 max-w-xl text-sm text-white/45">A clear record of activity across {membership.organization.name}.</p></div><div className="rounded-xl border border-white/10 bg-[#101c27] px-4 py-3 text-sm text-white/45"><span className="font-semibold text-white">{logs.length}</span> recent events</div></header>
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#101c27]">
          <div className="hidden grid-cols-[120px_1fr_170px] gap-4 border-b border-white/10 px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 sm:grid"><span>Level</span><span>Event</span><span className="text-right">Time</span></div>
          {logs.length === 0 ? <div className="flex flex-col items-center justify-center px-6 py-24 text-center"><CheckCircle2 className="size-10 text-[var(--mint)]" /><h2 className="mt-4 text-lg font-semibold">No activity yet</h2><p className="mt-2 text-sm text-white/45">Workspace events will appear here as actions are performed.</p></div> : <div className="divide-y divide-white/10">{logs.map((log) => { const style = levelStyles[log.level as keyof typeof levelStyles] ?? levelStyles.info; const Icon = style.icon; return <article key={log.id} className="grid gap-3 px-6 py-5 sm:grid-cols-[120px_1fr_170px] sm:items-center sm:gap-4"><div><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${style.className}`}><Icon className="size-3.5" />{log.level}</span></div><div><p className="font-semibold">{log.message}</p><p className="mt-1 text-xs text-white/35">{log.action}{log.user ? ` · ${log.user.name || log.user.email}` : ''}</p></div><time dateTime={log.createdAt.toISOString()} className="text-xs text-white/35 sm:text-right">{formatDate(log.createdAt)}</time></article> })}</div>}
        </section>
      </div>
    </main>
  )
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
