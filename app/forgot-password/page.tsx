import { ForgotPasswordForm } from '@/components/password-recovery-forms'
import { LandingShell } from '@/components/landing-shell'

export default function ForgotPasswordPage() {
  return (
    <LandingShell mode="forgot-password">
      <ForgotPasswordForm />
    </LandingShell>
  )
}
