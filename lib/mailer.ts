import { logger } from '@/lib/logger'
import { sendGraphOrganizationInvitationEmail, sendGraphPasswordResetEmail, sendGraphVerificationEmail } from '@/lib/graph-mail'

export async function sendInvitationEmail({ email, invitationId, organizationName, role }: { email: string; invitationId: string; organizationName: string; role: string }) {
  const configuredBaseUrl = process.env.BETTER_AUTH_URL
    ?? (process.env.VERCEL_ENV === 'production' ? 'https://biz.azharhussain.net' : undefined)
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
    ?? process.env.V0_RUNTIME_URL
    ?? 'http://localhost:3000'
  const baseUrl = configuredBaseUrl.replace(/\/$/, '')
  const inviteUrl = `${baseUrl}/organization/accept-invitation?id=${encodeURIComponent(invitationId)}`
  logger.info('Sending organization invitation through Microsoft Graph', { action: 'organization.invitation.send', recipient: email.replace(/(^.).*(@.*$)/, '$1***$2'), organizationName, role })
  await sendGraphOrganizationInvitationEmail({ to: email, inviteUrl, organizationName, role })
}

export async function sendPasswordResetEmail({ email, url }: { email: string; url: string }) {
  logger.info('Sending password reset email through Microsoft Graph', { action: 'auth.password_reset.send', recipient: email.replace(/(^.).*(@.*$)/, '$1***$2') })
  await sendGraphPasswordResetEmail({ to: email, url })
}

export async function sendVerificationCode({ email, otp }: { email: string; otp: string }) {
  logger.info('Sending verification email through Microsoft Graph', { action: 'auth.verification_email.send', recipient: email.replace(/(^.).*(@.*$)/, '$1***$2') })
  await sendGraphVerificationEmail({ to: email, otp })
}
