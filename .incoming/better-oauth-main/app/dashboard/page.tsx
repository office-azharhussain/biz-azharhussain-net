import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, Bell, ChevronDown, CircleDollarSign, CreditCard, LayoutDashboard, LifeBuoy, ListChecks, Plus, Receipt, Settings2, ShieldCheck, Users, WalletCards } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SignOutButton } from '@/components/sign-out-button'
import { OrganizationSwitcher } from '@/components/organization-switcher'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-vGkcxkZYbisgjSX2hHJ10YM18jRpc8.png'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Transactions', icon: Receipt },
  { label: 'Cards & limits', icon: CreditCard },
  { label: 'Team spend', icon: Users },
  { label: 'Policies', icon: ShieldCheck },
]

const spendBars = [38, 46, 42, 62, 57, 68, 55, 75, 64, 88, 72, 81]
const transactions = [
  { merchant: 'AWS Cloud Services', category: 'Infrastructure', amount: '$8,420.00', status: 'Approved', tone: 'bg-[#dff7ee] text-[#168b74]' },
  { merchant: 'Figma', category: 'Software', amount: '$1,240.00', status: 'Approved', tone: 'bg-[#dff7ee] text-[#168b74]' },
  { merchant: 'Air France', category: 'Travel', amount: '$2,864.50', status: 'Review', tone: 'bg-[#fff0d8] text-[#aa6a18]' },
  { merchant: 'LinkedIn Ads', category: 'Marketing', amount: '$980.00', status: 'Approved', tone: 'bg-[#dff7ee] text-[#168b74]' },
]

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ organizationSlug?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')
  const { organizationSlug } = (await searchParams) ?? {}
  const membership = organizationSlug
    ? await prisma.member.findFirst({ where: { userId: session.user.id, organization: { slug: organizationSlug } }, include: { organization: { include: { tenantDatabase: true } } } })
    : await prisma.member.findFirst({ where: { userId: session.user.id }, include: { organization: { include: { tenantDatabase: true } } }, orderBy: { createdAt: 'asc' } })
  if (!membership) redirect('/dashboard')
  const organization = membership.organization
  const firstName = session.user.name.split(' ')[0]

  return (
    <main className="min-h-screen bg-[#f7f9f8] text-[#122c35] [color-scheme:light]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#dce9e5] bg-white px-5 py-6 lg:flex">
          <Link href="/" className="flex items-center gap-3 px-3" aria-label="ChargeUp home">
            <img src={logoUrl} alt="ChargeUp logo" className="size-9 object-contain" />
            <span className="font-display text-2xl tracking-wide">ChargeUp</span>
          </Link>
          <div className="mt-12 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#91a5a8]">Workspace</div>
          <nav className="mt-3 flex flex-col gap-1" aria-label="Main navigation">
            {navItems.map(({ label, icon: Icon, active }) => <Link key={label} href="#" className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${active ? 'bg-[#e4f7f0] text-[#138e75]' : 'text-[#61777b] hover:bg-[#f3f8f6] hover:text-[#123844]'}`}><Icon className="size-4" />{label}</Link>)}
          </nav>
          <div className="mt-auto flex flex-col gap-1 border-t border-[#edf3f0] pt-5"><Link href="/logs" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#61777b] hover:bg-[#f3f8f6]"><ListChecks className="size-4" />Activity logs</Link><Link href="/settings/security" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#61777b] hover:bg-[#f3f8f6]"><Settings2 className="size-4" />Settings</Link><Link href="#" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#61777b] hover:bg-[#f3f8f6]"><LifeBuoy className="size-4" />Help center</Link></div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-[#dce9e5] bg-white px-5 sm:px-8"><div className="flex items-center gap-3 lg:hidden"><img src={logoUrl} alt="ChargeUp logo" className="size-8 object-contain" /><span className="font-display text-xl tracking-wide">ChargeUp</span></div><div className="hidden text-sm text-[#61777b] sm:block">Tuesday, October 24, 2024</div><div className="flex items-center gap-3"><button aria-label="Notifications" className="relative flex size-10 items-center justify-center rounded-full border border-[#dce9e5] bg-white text-[#61777b] hover:bg-[#f3f8f6]"><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#16b995]" /></button><div className="flex items-center gap-3 border-l border-[#dce9e5] pl-3"><div className="flex size-9 items-center justify-center rounded-full bg-[#123844] text-sm font-semibold text-white">{firstName.charAt(0)}</div><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{session.user.name}</p><p className="text-xs text-[#7c9294]">Finance admin</p></div><ChevronDown className="hidden size-4 text-[#91a5a8] sm:block" /></div><SignOutButton /></div></header>

          <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#16a386]">Spend control center</p><h1 className="mt-3 font-display text-5xl leading-none tracking-wide sm:text-6xl">Good morning, {firstName}.</h1><p className="mt-4 text-[#61777b]">Here&apos;s the pulse of your company spend.</p></div><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123844] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#123844]/10 hover:bg-[#1a4b58]"><Plus className="size-4" />Add spend rule</button></div>

            <div className="mt-8"><OrganizationSwitcher /></div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total spend" value="$248,420" change="12.4%" detail="vs. last month" positive icon={CircleDollarSign} /><StatCard label="Policy compliance" value="96.8%" change="4.2%" detail="vs. last month" positive icon={ShieldCheck} /><StatCard label="Pending approvals" value="18" change="6" detail="need your review" icon={ListChecks} /><StatCard label="Active cards" value="42" change="3" detail="issued this month" positive icon={WalletCards} /></div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.75fr]"><section className="rounded-2xl border border-[#dce9e5] bg-white p-5 sm:p-7"><div className="flex items-start justify-between"><div><h2 className="text-lg font-semibold">Spend overview</h2><p className="mt-1 text-sm text-[#7c9294]">Your organization&apos;s spend over time</p></div><button className="flex items-center gap-2 rounded-lg border border-[#dce9e5] px-3 py-2 text-xs font-medium text-[#61777b]">Last 12 months <ChevronDown className="size-3.5" /></button></div><div className="mt-7 flex items-end gap-2 sm:gap-3" aria-label="Monthly spend bar chart">{spendBars.map((height, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className="flex h-48 w-full items-end"><div className={`w-full rounded-t-md ${index === 9 ? 'bg-[#16b995]' : 'bg-[#c9eee2]'}`} style={{ height: `${height}%` }} /></div><span className="text-[10px] text-[#91a5a8]">{['Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'][index]}</span></div>)}</div><div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#7c9294]"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#c9eee2]" />Monthly spend</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#16b995]" />Current month</span></div></section><section className="rounded-2xl bg-[#123844] p-6 text-white"><div className="flex items-center justify-between"><div className="flex size-10 items-center justify-center rounded-xl bg-white/10"><ShieldCheck className="size-5 text-[#74dec3]" /></div><span className="rounded-full bg-[#1b635f] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#a5f0dc]">Healthy</span></div><h2 className="mt-7 font-display text-3xl tracking-wide">Policy health</h2><p className="mt-2 text-sm leading-6 text-white/60">Your spend controls are working well across all departments.</p><div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[96.8%] rounded-full bg-[#55d6b7]" /></div><div className="mt-3 flex justify-between text-xs text-white/55"><span>96.8% compliant</span><span>Target 95%</span></div><Link href="#" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#74dec3]">Review policies <ArrowUpRight className="size-4" /></Link></section></div>

            <section className="mt-6 rounded-2xl border border-[#dce9e5] bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Recent transactions</h2><p className="mt-1 text-sm text-[#7c9294]">Keep an eye on the latest activity</p></div><Link href="#" className="text-sm font-semibold text-[#138e75] hover:text-[#123844]">View all <ArrowUpRight className="ml-1 inline size-4" /></Link></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b border-[#edf3f0] text-xs uppercase tracking-wider text-[#91a5a8]"><tr><th className="pb-3 font-medium">Merchant</th><th className="pb-3 font-medium">Category</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Status</th></tr></thead><tbody className="divide-y divide-[#edf3f0]">{transactions.map((transaction) => <tr key={transaction.merchant}><td className="py-4 font-semibold">{transaction.merchant}</td><td className="py-4 text-[#7c9294]">{transaction.category}</td><td className="py-4 font-semibold">{transaction.amount}</td><td className="py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${transaction.tone}`}>{transaction.status}</span></td></tr>)}</tbody></table></div></section></div>
        </section>
      </div>
    </main>
  )
}

function StatCard({ label, value, change, detail, positive, icon: Icon }: { label: string; value: string; change: string; detail: string; positive?: boolean; icon: typeof CircleDollarSign }) {
  return <article className="rounded-2xl border border-[#dce9e5] bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm text-[#61777b]">{label}</p><Icon className="size-4 text-[#16a386]" /></div><p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-2 flex items-center gap-1 text-xs text-[#7c9294]"><span className={`flex items-center font-semibold ${positive ? 'text-[#168b74]' : 'text-[#aa6a18]'}`}>{positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}{change}</span>{detail}</p></article>
}
