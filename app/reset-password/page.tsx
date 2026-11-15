import { ResetPasswordForm } from '@/components/password-recovery-forms'
import { LandingShell } from '@/components/landing-shell'

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[]; error?: string | string[] }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token: tokenParam, error: errorParam } = await searchParams
  const token = Array.isArray(tokenParam) ? tokenParam[0] ?? null : tokenParam ?? null
  const error = Array.isArray(errorParam) ? errorParam[0] : errorParam

  return (
    <LandingShell mode="reset-password">
      <ResetPasswordForm token={token} invalidToken={error === 'INVALID_TOKEN'} />
    </LandingShell>
  )
}
