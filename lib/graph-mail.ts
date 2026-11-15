import { ClientSecretCredential } from '@azure/identity'
import { Client } from '@microsoft/microsoft-graph-client'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'
import { logger } from '@/lib/logger'

const verificationSender = process.env.MICROSOFT_GRAPH_SENDER ?? 'no-reply@biz.azharhussain.net'
const graphScopes = ['https://graph.microsoft.com/.default']

function createApplicationClient() {
  const tenantId = process.env.MICROSOFT_TENANT_ID
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
  const missing = [
    !tenantId && 'MICROSOFT_TENANT_ID',
    !clientId && 'MICROSOFT_CLIENT_ID',
    !clientSecret && 'MICROSOFT_CLIENT_SECRET',
  ].filter(Boolean)
  if (missing.length) throw new Error(`Microsoft Graph is missing configuration: ${missing.join(', ')}`)

  const credential = new ClientSecretCredential(tenantId!, clientId!, clientSecret!)
  const authProvider = new TokenCredentialAuthenticationProvider(credential, { scopes: graphScopes })
  return Client.initWithMiddleware({ authProvider })
}

export async function sendGraphOrganizationInvitationEmail({ to, organizationName, role, inviteUrl }: { to: string; organizationName: string; role: string; inviteUrl: string }) {
  await createApplicationClient().api(`/users/${encodeURIComponent(verificationSender)}/sendMail`).post({
    message: {
      subject: `You have been invited to join ${organizationName} on Biz`,
      body: {
        contentType: 'HTML',
        content: `<div style="font-family:Arial,sans-serif;color:#18313a;max-width:520px"><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#087f68;font-weight:700">Biz workspace</p><h1 style="font-size:28px;margin:16px 0">You&apos;re invited</h1><p>You have been invited to join <strong>${escapeHtml(organizationName)}</strong> as a ${escapeHtml(role)}.</p><p><a href="${escapeHtml(inviteUrl)}" style="display:inline-block;border-radius:10px;background:#087f68;color:#fff;padding:12px 18px;text-decoration:none;font-weight:700">Accept invitation</a></p></div>`,
      },
      toRecipients: [{ emailAddress: { address: to } }],
    },
    saveToSentItems: true,
  })
}

export async function sendGraphPasswordResetEmail({ to, url }: { to: string; url: string }) {
  const graph = createApplicationClient()
  try {
    await graph.api(`/users/${encodeURIComponent(verificationSender)}/sendMail`).post({
      message: {
        subject: 'Reset your Biz password',
        body: {
          contentType: 'HTML',
          content: `<div style="font-family:Arial,sans-serif;color:#18313a;max-width:520px"><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#087f68;font-weight:700">Biz account security</p><h1 style="font-size:28px;margin:16px 0">Reset password</h1><p>Use the secure link below to set a new password for your Biz account.</p><p><a href="${escapeHtml(url)}" style="display:inline-block;border-radius:10px;background:#087f68;color:#fff;padding:12px 18px;text-decoration:none;font-weight:700">Reset password</a></p><p style="color:#647780;font-size:13px">If you did not request this, you can ignore this email.</p></div>`,
        },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: true,
    })
  } catch (error) {
    logger.error('Microsoft Graph rejected password reset email', { action: 'auth.password_reset.graph_error', reason: error instanceof Error ? error.message : 'Unknown error' })
    throw new Error('Microsoft Graph rejected password reset email')
  }
}

export async function sendGraphVerificationEmail({ to, otp }: { to: string; otp: string }) {
  const graph = createApplicationClient()
  try {
    await graph.api(`/users/${encodeURIComponent(verificationSender)}/sendMail`).post({
      message: {
        subject: 'Your Biz verification code',
        body: {
          contentType: 'HTML',
          content: `<div style="font-family:Arial,sans-serif;color:#18313a;max-width:520px"><p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#087f68;font-weight:700">Biz account security</p><h1 style="font-size:28px;margin:16px 0">Verify your email</h1><p>Use this one-time code to finish creating your Biz account:</p><p style="font-size:32px;letter-spacing:8px;font-weight:700;color:#18313a;background:#f1f6f5;padding:20px;border-radius:12px;text-align:center">${escapeHtml(otp)}</p><p style="color:#647780;font-size:13px">This code expires soon. If you did not request it, you can ignore this email.</p></div>`,
        },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: true,
    })
  } catch (error) {
    logger.error('Microsoft Graph rejected verification email', { action: 'auth.verification_email.graph_error', reason: error instanceof Error ? error.message : 'Unknown error' })
    throw new Error('Microsoft Graph rejected verification email')
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character)
}
