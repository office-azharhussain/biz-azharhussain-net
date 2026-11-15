import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { LandingShell } from '@/components/landing-shell'
import { auth } from '@/lib/auth'

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/dashboard')

  return (
    <LandingShell mode="sign-in">
      <AuthForm mode="sign-in" />
    </LandingShell>
  )
}
