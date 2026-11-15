import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PasskeySettings } from '@/components/passkey-settings'
import { PasswordResetSettings } from '@/components/password-reset-settings'
import { TwoFactorSettings } from '@/components/two-factor-settings'

export default async function SecuritySettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <main className="min-h-screen bg-[var(--ink-950)] text-white [color-scheme:dark]">
      <header className="border-b border-white/10 bg-[#101c27]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="ChargeUp AI Lab dashboard">
            <BrandLogo size={36} />
            <span className="font-display text-2xl tracking-wide">ChargeUp AI Lab</span>
          </Link>
          <Link href="/dashboard" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/75 transition-colors hover:bg-[#101c27]/10">Back to dashboard</Link>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--mint)]">Workspace settings</p><h1 className="mt-3 font-display text-6xl leading-none tracking-wide">Security & access</h1><p className="mt-5 text-lg leading-8 text-white/55">Keep your ChargeUp AI Lab account protected with modern sign-in controls and recovery options.</p></div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <PasswordResetSettings email={session.user.email} />
          <PasskeySettings />
          <TwoFactorSettings />
        </div>
      </section>
    </main>
  )
}
