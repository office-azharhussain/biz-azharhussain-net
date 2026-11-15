import { Suspense } from 'react'
import TwoFactorForm from '@/components/two-factor-form'

function TwoFactorFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f8f8] px-6 py-12 text-[#203740] [color-scheme:light]">
      <div role="status" aria-live="polite" className="w-full max-w-md rounded-[2rem] border border-[#dfe7e8] bg-white p-8 text-sm text-[#60747c]">
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
