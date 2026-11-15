import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, CircleDollarSign, Layers3, ShieldCheck, Sparkles } from 'lucide-react'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-vGkcxkZYbisgjSX2hHJ10YM18jRpc8.png'

const features = [
  { icon: ShieldCheck, title: 'Policy-led spend', text: 'Set guardrails once and give every team the clarity to spend confidently.' },
  { icon: Layers3, title: 'One source of truth', text: 'Bring cards, invoices, reimbursements, and approvals into one operating view.' },
  { icon: CircleDollarSign, title: 'Real-time control', text: 'See where every dollar is going, before month-end surprises arrive.' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9f8] text-[#122c35]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="ChargeUp home">
          <Image src={logoUrl} alt="ChargeUp logo" width={40} height={40} className="object-contain" unoptimized />
          <span className="font-display text-[1.65rem] tracking-wide">ChargeUp</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#platform" className="transition-colors hover:text-[#16b995]">Platform</a>
          <a href="#why-chargeup" className="transition-colors hover:text-[#16b995]">Why ChargeUp</a>
          <a href="#contact" className="transition-colors hover:text-[#16b995]">Contact</a>
        </div>
        <div className="flex items-center gap-3 text-sm font-medium">
          <Link href="/sign-in" className="hidden px-3 py-2 transition-colors hover:text-[#16b995] sm:block">Sign in</Link>
          <Link href="/sign-up" className="rounded-full bg-[#123844] px-5 py-2.5 text-white transition-transform hover:-translate-y-0.5">Getting Started</Link>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-32 lg:pt-24">
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#cfe4dc] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#168b74]"><Sparkles className="size-3.5" /> Spend governance, elevated</div>
          <h1 className="max-w-3xl font-display text-6xl leading-[0.93] tracking-wide sm:text-7xl lg:text-[6.7rem]">Spend with <span className="text-[#12af8d]">purpose.</span></h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[#557078]">ChargeUp gives finance and teams a shared command center for smarter, safer, and more strategic business spending.</p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"><Link href="/sign-up" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#123844] px-7 py-4 font-semibold text-white shadow-xl shadow-[#123844]/15 transition-transform hover:-translate-y-0.5">See ChargeUp in action <ArrowRight className="size-4" /></Link><a href="#platform" className="inline-flex items-center justify-center gap-2 px-3 py-4 text-sm font-semibold text-[#123844]">Explore the platform <ChevronDown className="size-4" /></a></div>
          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#557078]"><span className="flex items-center gap-2"><Check className="size-4 text-[#12af8d]" /> Built for modern finance</span><span className="flex items-center gap-2"><Check className="size-4 text-[#12af8d]" /> Enterprise-ready controls</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-xl lg:justify-self-end">
          <div className="absolute -right-14 -top-16 size-72 rounded-full bg-[#d7f3e9] blur-3xl" />
          <div className="relative rounded-[2rem] border border-[#d6e6e1] bg-white p-3 shadow-2xl shadow-[#164b4a]/10">
            <div className="rounded-[1.5rem] bg-[#123844] p-5 text-white sm:p-7">
              <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.18em] text-white/55">Control center</p><p className="mt-2 font-display text-2xl tracking-wide">October overview</p></div><div className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-[#91e6cc]">Live data</div></div>
              <div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-white/55">Total spend</p><p className="mt-2 text-2xl font-semibold">$248,420</p><p className="mt-2 text-xs text-[#91e6cc]">↓ 12.4% vs last month</p></div><div className="rounded-2xl bg-[#16b995] p-4"><p className="text-xs text-white/75">Under policy</p><p className="mt-2 text-2xl font-semibold">96.8%</p><p className="mt-2 text-xs text-white/75">+4.2% this month</p></div></div>
              <div className="mt-4 rounded-2xl bg-white/10 p-4"><div className="flex items-center justify-between text-xs text-white/55"><span>Spend by department</span><span>View report</span></div><div className="mt-5 flex h-28 items-end gap-3 px-2">{[38, 65, 48, 82, 57, 92, 70, 100, 78, 88, 62, 76].map((height, index) => <div key={index} className="flex-1 rounded-t-md bg-[#69dbc0]/80" style={{ height: `${height}%` }} />)}</div></div>
            </div>
          </div>
          <div className="absolute -bottom-7 -left-7 hidden rounded-2xl border border-[#d6e6e1] bg-white p-4 shadow-xl sm:block"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-[#e1f8f0] text-[#12af8d]"><ShieldCheck className="size-4" /></div><div><p className="text-xs text-[#557078]">Policy compliance</p><p className="text-sm font-semibold">Healthy across teams</p></div></div></div>
        </div>
      </section>

      <section id="platform" className="border-y border-[#dce9e5] bg-white"><div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#16a386]">A better operating model</p><h2 className="mt-4 font-display text-5xl leading-none tracking-wide sm:text-6xl">Governance that moves at the speed of business.</h2></div><div className="mt-14 grid gap-4 md:grid-cols-3">{features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-[#dce9e5] bg-[#f8fbfa] p-7"><div className="flex size-11 items-center justify-center rounded-xl bg-[#dff7ee] text-[#129b80]"><Icon className="size-5" /></div><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-[#557078]">{text}</p></article>)}</div></div></section>

      <section id="why-chargeup" className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-28"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#16a386]">Built for alignment</p><h2 className="mt-4 max-w-md font-display text-5xl leading-none tracking-wide">Clarity is your competitive edge.</h2></div><div className="grid gap-8 sm:grid-cols-2"><div><p className="font-display text-5xl text-[#12af8d]">01</p><h3 className="mt-3 text-lg font-semibold">Empower every team</h3><p className="mt-2 leading-7 text-[#557078]">Replace friction with clear, flexible controls people actually want to use.</p></div><div><p className="font-display text-5xl text-[#12af8d]">02</p><h3 className="mt-3 text-lg font-semibold">Protect the bottom line</h3><p className="mt-2 leading-7 text-[#557078]">Turn spend data into confident decisions with the context finance needs.</p></div></div></section>

      <footer id="contact" className="bg-[#123844] text-white"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-10"><div className="flex items-center gap-3"><Image src={logoUrl} alt="ChargeUp logo" width={34} height={34} className="object-contain" unoptimized /><span className="font-display text-2xl tracking-wide">ChargeUp</span></div><div className="flex flex-col gap-3 text-sm text-white/65 sm:items-end"><p>Spend governance for the businesses shaping what&apos;s next.</p><Link href="/sign-up" className="font-semibold text-[#75e2c7] hover:text-white">Start a conversation <ArrowRight className="ml-1 inline size-4" /></Link></div></div></footer>
    </main>
  )
}

