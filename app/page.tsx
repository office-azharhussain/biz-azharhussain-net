import { Suspense } from 'react'
import { AuthForm } from '@/components/auth-form'
import { LandingShell } from '@/components/landing-shell'

export default function HomePage() {
  return (
    <LandingShell mode="sign-in">
      <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-slate-100" />}>
        <AuthForm mode="sign-in" />
      </Suspense>
    </LandingShell>
  )
}
