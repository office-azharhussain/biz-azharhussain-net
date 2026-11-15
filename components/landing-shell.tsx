'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Check, CircleDashed, Command, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import type { ReactNode } from 'react'

const authEase: [number, number, number, number] = [0.22, 1, 0.36, 1]
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: authEase } } }
type LandingMode = 'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password'
const modeCopy: Record<LandingMode, { title: string; description: string }> = {
  'sign-in': { title: 'Welcome back', description: 'Sign in to your secure business workspace.' },
  'sign-up': { title: 'Create your account', description: 'Get access to your organization’s business workspace.' },
  'forgot-password': { title: 'Recover your account', description: 'Enter your email and we will send a secure password reset link if an account exists.' },
  'reset-password': { title: 'Set a new password', description: 'Choose a new password to get back into your workspace.' },
}

export function LandingShell({ children, mode }: { children: ReactNode; mode: LandingMode }) {
  const { title, description } = modeCopy[mode]
  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#172b36] selection:bg-[#d9f3ec] selection:text-[#123d35]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#dfe7e8] pb-5">
          <Link href="/" className="flex items-center gap-3" aria-label="Biz home">
            <BrandLogo size={40} />
            <span className="text-lg font-semibold tracking-tight">Biz<span className="text-[#087f68]">.</span></span>
          </Link>
          <div className="hidden items-center gap-6 text-xs font-medium text-[#657981] sm:flex">
            <span>Business operations</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dce8e5] bg-white px-3 py-1.5 text-[#087f68]"><ShieldCheck className="size-3.5" /> Secure workspace</span>
          </div>
        </header>
        <div className="grid flex-1 items-center gap-12 py-10 md:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] lg:gap-20">
          <section className="max-w-2xl">
            <motion.div initial={false} animate="visible" variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dce8e5] bg-white px-3 py-1.5 text-xs font-semibold text-[#087f68]">
              <span className="size-1.5 rounded-full bg-[#13a387]" /> A clearer view of your business
            </motion.div>
            <motion.h1 initial={false} animate="visible" variants={fadeUp} className="max-w-2xl text-[clamp(3rem,6.6vw,6rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-[#152b35]">
              Run your business with <span className="text-[#087f68]">confidence.</span>
            </motion.h1>
            <motion.p initial={false} animate="visible" variants={fadeUp} className="mt-7 max-w-xl text-lg leading-8 text-[#60747c]">
              A connected workspace for your people, operations, and business insights — designed to make everyday work feel effortless.
            </motion.p>
            <div className="mt-9 flex flex-wrap gap-2.5">
              {['Team workspace', 'Business insights', 'Secure by design'].map((item) => <span key={item} className="inline-flex items-center gap-2 rounded-full border border-[#dce5e7] bg-white px-3.5 py-2 text-xs font-medium text-[#536971]"><Check className="size-3.5 text-[#087f68]" />{item}</span>)}
            </div>
            <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.6 }} className="mt-14 hidden max-w-xl rounded-2xl border border-[#dfe7e8] bg-white p-5 shadow-[0_12px_40px_rgba(24,55,64,0.05)] sm:block">
              <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#73858b]">Your work, in sync</p><p className="mt-1 text-sm font-semibold text-[#203740]">One workspace. Shared context.</p></div><ArrowUpRight className="size-4 text-[#829297]" /></div>
              <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#536971]"><span className="flex items-center gap-2"><CircleDashed className="size-4 text-[#087f68]" /> Organize</span><span className="h-px flex-1 bg-[#dce5e7]" /><span className="flex items-center gap-2"><Command className="size-4 text-[#5682a0]" /> Understand</span><span className="h-px flex-1 bg-[#dce5e7]" /><span className="flex items-center gap-2"><Zap className="size-4 text-[#b78b39]" /> Move forward</span></div>
            </motion.div>
          </section>
          <motion.section initial={false} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12, duration: 0.55, ease: authEase }} className="relative" aria-labelledby="auth-heading">
            <div className="relative rounded-[1.5rem] border border-[#dfe7e8] bg-white p-5 shadow-[0_24px_70px_rgba(20,51,61,0.08)] sm:p-8">
              <div className="mb-7 flex items-start justify-between"><div><div className="mb-5 grid size-11 place-items-center rounded-xl bg-[#e8f5f1] text-[#087f68]"><ShieldCheck className="size-5" /></div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#087f68]">Private workspace</p><h2 id="auth-heading" className="mt-2 text-3xl font-semibold tracking-tight text-[#172b36]">{title}</h2></div><ArrowUpRight className="size-5 text-[#9aa9ad]" /></div>
              <p className="mb-7 text-sm leading-6 text-[#667a82]">{description}</p>
              {children}
            </div>
          </motion.section>
        </div>
        <footer className="flex items-center justify-between border-t border-[#dfe7e8] pt-5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#819197]"><span>Biz · Azhar Hussain</span><span>biz.azharhussain.net</span></footer>
      </div>
    </main>
  )
}
