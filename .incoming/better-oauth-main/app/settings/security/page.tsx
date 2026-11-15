import Image from 'next/image'
import Link from 'next/link'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-vGkcxkZYbisgjSX2hHJ10YM18jRpc8.png'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { PasskeySettings } from '@/components/passkey-settings'
import { TwoFactorSettings } from '@/components/two-factor-settings'

export default async function SecuritySettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  return (
    <main className="min-h-screen bg-[#f7f9f8] text-[#122c35] [color-scheme:light]">
      <header className="border-b border-[#dce9e5] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/dashboard" className="flex items-center gap-3" aria-label="ChargeUp dashboard">
            <Image src={logoUrl} alt="ChargeUp logo" width={36} height={36} unoptimized />
            <span className="font-display text-2xl tracking-wide">ChargeUp</span>
          </Link>
          <Link href="/dashboard" className="rounded-full border border-[#cfe0db] px-4 py-2 text-sm font-semibold text-[#123844] transition-colors hover:bg-[#eaf7f2]">Back to dashboard</Link>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#16a386]">Workspace settings</p><h1 className="mt-3 font-display text-6xl leading-none tracking-wide">Security & access</h1><p className="mt-5 text-lg leading-8 text-[#557078]">Keep your ChargeUp account protected with modern sign-in controls and recovery options.</p></div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <PasskeySettings />
          <TwoFactorSettings />
        </div>
      </section>
    </main>
  )
}
