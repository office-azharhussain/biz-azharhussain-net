import { Suspense } from 'react'
import TwoFactorForm from '@/components/two-factor-form'

function TwoFactorFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--ink-950)] px-6 py-12 text-white [color-scheme:dark]">
      <div role="status" aria-live="polite" className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#101c27] p-8 text-sm text-white/60">
        Preparing verification…
      </div>
    </main>
  )
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<TwoFactorFallback />}>
      <TwoFactorForm />
    </Suspense>
  )
}
