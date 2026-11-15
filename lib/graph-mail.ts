import { logger } from '@/lib/logger'

const verificationSender = process.env.SMTP_FROM?.match(/<([^>]+)>/)?.[1] ?? process.env.SMTP_FROM ?? 'no-reply@chargeup.app'

type InvitationMail = {
  accessToken: string
  to: string
  organizationName: string
  inviteUrl: string
}

export async function sendGraphInvitationEmail({ accessToken, to, organizationName, inviteUrl }: InvitationMail) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: `You're invited to join ${organizationName} on ChargeUp AI Lab`,
        body: {
          contentType: 'HTML',
          content: `<p>You have been invited to join <strong>${escapeHtml(organizationName)}</strong> as a guest.</p><p><a href="${escapeHtml(inviteUrl)}">Accept your invitation</a></p><p>This invitation expires in 7 days.</p>`,
        },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: true,
    }),
  })

  if (response.status === 202) return { sent: true as const }
  const detail = await response.text().catch(() => '')
  return { sent: false as const, status: response.status, detail }
}

export async function sendGraphPasswordResetEmail({ to, url }: { to: string; url: string }) {
  const { accessToken, sender } = await getApplicationMailToken()
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: 'Reset your ChargeUp AI Lab password',
        body: {
          contentType: 'HTML',
          content: `<div style="font-family:Arial,sans-serif;color:#123844;max-width:520px"><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#16a386;font-weight:700">ChargeUp account security</p><h1 style="font-size:28px;margin:16px 0">Reset your password</h1><p>Use the secure link below to set a new password for your ChargeUp AI Lab account.</p><p><a href="${escapeHtml(url)}" style="display:inline-block;border-radius:10px;background:#123844;color:#fff;padding:12px 18px;text-decoration:none;font-weight:700">Reset password</a></p><p style="color:#557078;font-size:13px">If you did not request this, you can ignore this email.</p></div>`,
        },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: true,
    }),
  })

  if (response.status !== 202) {
    logger.error('Microsoft Graph rejected password reset email', { action: 'auth.password_reset.graph_error', status: response.status })
    throw new Error(`Microsoft Graph rejected password reset email (${response.status})`)
  }
}

export async function sendGraphVerificationEmail({ to, otp }: { to: string; otp: string }) {
  const { accessToken, sender } = await getApplicationMailToken()
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        subject: 'Your ChargeUp verification code',
        body: {
          contentType: 'HTML',
          content: `<div style="font-family:Arial,sans-serif;color:#123844;max-width:520px"><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#16a386;font-weight:700">ChargeUp account security</p><h1 style="font-size:28px;margin:16px 0">Verify your email</h1><p>Use this one-time code to finish creating your ChargeUp account:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#123844;background:#f3f8f6;padding:20px;border-radius:12px;text-align:center">${escapeHtml(otp)}</p><p style="color:#557078;font-size:13px">This code expires soon. If you did not request it, you can ignore this email.</p></div>`,
        },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: true,
    }),
  })

  if (response.status !== 202) {
    logger.error('Microsoft Graph rejected verification email', { action: 'auth.verification_email.graph_error', status: response.status })
    throw new Error(`Microsoft Graph rejected verification email (${response.status})`)
  }
}

async function getApplicationMailToken() {
  const tenantId = process.env.MICROSOFT_TENANT_ID
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
  const missing = [
    !tenantId && 'MICROSOFT_TENANT_ID',
    !clientId && 'MICROSOFT_CLIENT_ID',
    !clientSecret && 'MICROSOFT_CLIENT_SECRET',
  ].filter(Boolean)

  if (missing.length) {
    throw new Error(`Microsoft Graph email is missing configuration: ${missing.join(', ')}`)
  }

  const tokenResponse = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenantId!)}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
    cache: 'no-store',
  })

  if (!tokenResponse.ok) {
    logger.error('Microsoft identity platform rejected Graph mail token request', { action: 'auth.verification_email.token_error', status: tokenResponse.status })
    throw new Error(`Microsoft Graph token request failed (${tokenResponse.status})`)
  }

  const token = await tokenResponse.json() as { access_token?: string }
  if (!token.access_token) throw new Error('Microsoft Graph token response did not include an access token')

  return { accessToken: token.access_token, sender: verificationSender }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character)
}
