'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, Bot, Check, CircleDashed, Command, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import type { ReactNode } from 'react'

const authEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: authEase } },
}

type LandingMode = 'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password'

const modeCopy: Record<LandingMode, { title: string; description: string }> = {
  'sign-in': { title: 'Welcome back.', description: 'Sign in to access your agents, experiments, and team systems.' },
  'sign-up': { title: 'Create your account.', description: 'Create an account to access your agents, experiments, and team systems.' },
  'forgot-password': { title: 'Recover your account.', description: 'Enter your email and we will send a secure password reset link if an account exists.' },
  'reset-password': { title: 'Set a new password.', description: 'Choose a new password to get back into your workspace.' },
}

export function LandingShell({ children, mode }: { children: ReactNode; mode: LandingMode }) {
  const { title, description } = modeCopy[mode]
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--ink-950)] text-white selection:bg-[var(--mint)] selection:text-[var(--ink-950)]">
      <div className="relative isolate mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 py-5 sm:px-8 md:h-[100svh] md:max-h-[100svh] md:overflow-hidden lg:px-12">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_10%,rgba(61,214,170,0.13),transparent_28%),radial-gradient(circle_at_87%_52%,rgba(69,108,255,0.12),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />

        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="group flex items-center gap-3" aria-label="ChargeUp AI Lab home">
            <span className="grid size-9 place-items-center rounded-xl border border-white/15 bg-white/[0.08] shadow-[0_0_32px_rgba(61,214,170,0.15)] transition-transform group-hover:rotate-6">
              <BrandLogo size={25} />
            </span>
            <span className="font-display text-lg tracking-[0.05em] text-white">ChargeUp <span className="text-[var(--mint)]">AI Lab</span></span>
          </Link>
          <div className="hidden items-center gap-7 text-xs font-medium uppercase tracking-[0.18em] text-white/45 sm:flex">
            <span>Intelligence infrastructure</span>
            <span className="flex items-center gap-2 text-[var(--mint)]"><span className="size-1.5 animate-pulse rounded-full bg-[var(--mint)]" /> Systems online</span>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-16 py-8 md:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] md:gap-8 lg:gap-16 lg:py-10">
          <section className="relative max-w-3xl">
            <motion.div initial={false} animate="visible" variants={fadeUp} className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--mint)]">
              <Sparkles className="size-3.5" /> The intelligence layer for ChargeUp
            </motion.div>
            <motion.h1 initial={false} animate="visible" variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { ...fadeUp.visible.transition, delay: 0.08 } } }} className="max-w-4xl font-display text-[clamp(3.2rem,7.2vw,6.5rem)] leading-[0.87] tracking-[-0.045em] text-white">
              Make every system <span className="text-[var(--mint)]">smarter.</span>
            </motion.h1>
            <motion.p initial={false} animate="visible" variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { ...fadeUp.visible.transition, delay: 0.16 } } }} className="mt-8 max-w-xl text-lg leading-8 text-white/58 sm:text-xl">
              Build, deploy, and operate the agents and automations that move ChargeUp forward — from one focused workspace.
            </motion.p>
            <motion.div initial={false} animate="visible" variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { ...fadeUp.visible.transition, delay: 0.24 } } }} className="mt-10 flex flex-wrap gap-3">
              {['Agent studio', 'Automation ops', 'Team intelligence'].map((item) => <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-2 text-xs text-white/60"><Check className="size-3.5 text-[var(--mint)]" />{item}</span>)}
            </motion.div>

            <motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45, duration: 0.8 }} className="relative mt-16 hidden h-28 max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:block">
              <div className="absolute inset-y-0 left-[21%] w-px bg-white/10" /><div className="absolute inset-y-0 left-[51%] w-px bg-white/10" /><div className="absolute inset-y-0 left-[79%] w-px bg-white/10" />
              <div className="relative flex h-full items-center justify-between text-xs text-white/42"><span className="flex items-center gap-2"><CircleDashed className="size-4 text-[var(--mint)]" /> Observe</span><span className="h-px w-10 bg-[var(--mint)]/60" /><span className="flex items-center gap-2"><Command className="size-4 text-blue-300" /> Decide</span><span className="h-px w-10 bg-blue-300/60" /><span className="flex items-center gap-2"><Zap className="size-4 text-amber-300" /> Act</span></div>
            </motion.div>
          </section>

          <motion.section initial={false} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.8, ease: authEase }} className="relative" aria-labelledby="auth-heading">
            <div className="absolute -inset-5 rounded-[2rem] bg-[var(--mint)]/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#101c27]/90 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
              <div className="mb-8 flex items-start justify-between"><div><div className="mb-5 grid size-11 place-items-center rounded-2xl border border-[var(--mint)]/20 bg-[var(--mint)]/10 text-[var(--mint)]"><Bot className="size-5" /></div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mint)]">Private workspace</p><h2 id="auth-heading" className="mt-3 font-display text-3xl leading-none tracking-wide text-white">{title}</h2></div><ArrowUpRight className="size-5 text-white/30" /></div>
              <p className="mb-7 text-sm leading-6 text-white/50">{description}</p>
              {children}
            </div>
          </motion.section>
        </div>

        <footer className="flex items-center justify-between border-t border-white/10 pt-5 text-[10px] uppercase tracking-[0.2em] text-white/30"><span>ChargeUp AI Lab / 2026</span><span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-[var(--mint)]" /> Built for momentum</span></footer>
      </div>
    </main>
  )
}
