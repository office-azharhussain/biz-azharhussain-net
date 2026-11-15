import nodemailer from 'nodemailer'
import { logger } from '@/lib/logger'

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

export async function sendVerificationCode({ email, otp }: { email: string; otp: string }) {
  logger.info('Sending verification email', { action: 'auth.verification_email.send', recipient: email.replace(/(^.).*(@.*$)/, '$1***$2') })
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your ChargeUp verification code',
    text: `Your ChargeUp verification code is ${otp}. It expires soon. If you did not request this code, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;color:#123844;max-width:520px"><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#16a386;font-weight:700">ChargeUp account security</p><h1 style="font-size:28px;margin:16px 0">Verify your email</h1><p>Use this one-time code to finish creating your ChargeUp account:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#123844;background:#f3f8f6;padding:20px;border-radius:12px;text-align:center">${otp}</p><p style="color:#557078;font-size:13px">This code expires soon. If you did not request it, you can ignore this email.</p></div>`,
  })
}
