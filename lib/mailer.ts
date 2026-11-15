import nodemailer from 'nodemailer'
import { logger } from '@/lib/logger'
import { sendGraphPasswordResetEmail, sendGraphVerificationEmail } from '@/lib/graph-mail'

const smtpPort = Number(process.env.SMTP_PORT ?? 587)

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendInvitationEmail({ email, invitationId, organizationName, role }: { email: string; invitationId: string; organizationName: string; role: string }) {
  const configuredBaseUrl = process.env.BETTER_AUTH_URL
    ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
    ?? process.env.V0_RUNTIME_URL
    ?? 'http://localhost:3000'
  const baseUrl = configuredBaseUrl.replace(/\/$/, '')
  const url = `${baseUrl}/organization/accept-invitation?id=${encodeURIComponent(invitationId)}`
  logger.info('Sending organization invitation', { action: 'organization.invitation.send', recipient: email.replace(/(^.).*(@.*$)/, '$1***$2'), organizationName, role })
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'ChargeUp <no-reply@chargeup.app>',
    to: email,
    subject: `You have been invited to join ${organizationName} on ChargeUp`,
    text: `You have been invited to join ${organizationName} as a ${role}. Accept your invitation: ${url}`,
    html: `<p>You have been invited to join <strong>${organizationName}</strong> as a ${role}.</p><p><a href="${url}">Accept invitation</a></p>`,
  })
}

export async function sendPasswordResetEmail({ email, url }: { email: string; url: string }) {
  logger.info('Sending password reset email through Microsoft Graph', { action: 'auth.password_reset.send', recipient: email.replace(/(^.).*(@.*$)/, '$1***$2') })
  await sendGraphPasswordResetEmail({ to: email, url })
}

export async function sendVerificationCode({ email, otp }: { email: string; otp: string }) {
  logger.info('Sending verification email through Microsoft Graph', { action: 'auth.verification_email.send', recipient: email.replace(/(^.).*(@.*$)/, '$1***$2') })
  await sendGraphVerificationEmail({ to: email, otp })
}
