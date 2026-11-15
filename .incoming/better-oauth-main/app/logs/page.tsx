import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Activity, ArrowLeft, CheckCircle2, CircleAlert, Info, XCircle } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const levelStyles = {
  info: { icon: Info, className: 'bg-[#e8f6f2] text-[#138e75]' },
  warn: { icon: CircleAlert, className: 'bg-[#fff3df] text-[#aa6a18]' },
  error: { icon: XCircle, className: 'bg-[#ffebeb] text-[#c34242]' },
}

export default async function LogsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const membership = await prisma.member.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: 'asc' } })
  if (!membership) redirect('/dashboard')

  const logs = await prisma.auditLog.findMany({ where: { organizationId: membership.organizationId }, orderBy: { createdAt: 'desc' }, take: 200 })

  return (
    <main className="min-h-screen bg-[#f7f9f8] px-5 py-8 text-[#122c35] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#138e75] hover:text-[#123844]"><ArrowLeft className="size-4" />Back to dashboard</Link>
        <header className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#16a386]"><Activity className="size-4" />Audit trail</p><h1 className="mt-3 font-display text-5xl tracking-wide">Activity logs</h1><p className="mt-3 text-[#61777b]">A complete record of activity in your organization.</p></div><div className="rounded-xl border border-[#dce9e5] bg-white px-4 py-3 text-sm text-[#61777b]"><span className="font-semibold text-[#122c35]">{logs.length}</span> recent events</div></header>
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#dce9e5] bg-white shadow-sm"><div className="hidden grid-cols-[150px_1fr_160px] gap-4 border-b border-[#edf3f0] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#91a5a8] sm:grid"><span>Level</span><span>Event</span><span className="text-right">Time</span></div>{logs.length === 0 ? <div className="flex flex-col items-center justify-center px-6 py-20 text-center"><CheckCircle2 className="size-10 text-[#16a386]" /><h2 className="mt-4 text-lg font-semibold">No activity yet</h2><p className="mt-2 text-sm text-[#7c9294]">Organization activity will appear here as it happens.</p></div> : <div className="divide-y divide-[#edf3f0]">{logs.map((log) => { const style = levelStyles[log.level as keyof typeof levelStyles] ?? levelStyles.info; const Icon = style.icon; return <article key={log.id} className="grid gap-3 px-6 py-5 sm:grid-cols-[150px_1fr_160px] sm:items-center sm:gap-4"><div><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${style.className}`}><Icon className="size-3.5" />{log.level}</span></div><div><p className="font-semibold">{log.message}</p><p className="mt-1 text-xs text-[#91a5a8]">{log.action}{log.userId ? ` · ${log.userId}` : ''}</p></div><time dateTime={log.createdAt.toISOString()} className="text-xs text-[#7c9294] sm:text-right">{log.createdAt.toLocaleString()}</time></article> })}</div>}</section>
      </div>
    </main>
  )
}
