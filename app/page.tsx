import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth-form'
import { LandingShell } from '@/components/landing-shell'
import { auth } from '@/lib/auth'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/dashboard')

  return (
    <LandingShell mode="sign-in">
      <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl bg-slate-100" />}>
        <AuthForm mode="sign-in" />
      </Suspense>
    </LandingShell>
  )
}
