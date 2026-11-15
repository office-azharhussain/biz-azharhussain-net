import { betterAuth } from 'better-auth'
import { after } from 'next/server'
import { sso } from '@better-auth/sso'
import { passkey } from '@better-auth/passkey'
import { emailOTP, organization, twoFactor } from 'better-auth/plugins'
import { organizationAccessControl, organizationRoles } from '@/lib/organization-access'
import { sendInvitationEmail, sendPasswordResetEmail, sendVerificationCode } from '@/lib/mailer'
import { logger } from '@/lib/logger'
import { prismaAdapter } from '@better-auth/prisma-adapter'
import { prisma } from '@/lib/db'

const developmentOrigins = [
  'http://localhost:3000',
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
].filter((origin): origin is string => Boolean(origin))

const authBaseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_ENV === 'production'
    ? 'https://biz.azharhussain.net'
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000')

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql', transaction: true }),
  baseURL: authBaseURL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      after(async () => {
        try {
          await sendPasswordResetEmail({ email: user.email, url })
        } catch (error) {
          logger.error('Password reset email delivery failed', {
            action: 'auth.password_reset.delivery_error',
            reason: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      })
    },
  },
  socialProviders: {
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
      tenantId: process.env.MICROSOFT_TENANT_ID as string,
      authority: 'https://login.microsoftonline.com',
      prompt: 'select_account',
    },
  },
  appName: 'Biz',
  plugins: [
    passkey({
      rpName: 'Biz',
      rpID: new URL(authBaseURL).hostname,
      origin: authBaseURL,
    }),
    sso({
      providersLimit: 0,
      domainVerification: { enabled: true },
    }),
    organization({
      ac: organizationAccessControl,
      roles: organizationRoles,
      allowUserToCreateOrganization: false,
      organizationLimit: 1,
      sendInvitationEmail: async ({ id, email, organization: invitedOrganization, role }) => {
        await sendInvitationEmail({ email, invitationId: id, organizationName: invitedOrganization.name, role })
      },
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 5,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === 'email-verification') await sendVerificationCode({ email, otp })
      },
    }),
    twoFactor({
      issuer: 'Biz',
      accountLockout: { enabled: true, maxFailedAttempts: 5, durationSeconds: 300 },
    }),
  ],
  trustedOrigins:
    process.env.NODE_ENV === 'development'
      ? developmentOrigins
      : [
          'https://biz.azharhussain.net',
          'https://login.microsoftonline.com',
          'https://graph.microsoft.com',
          ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
        ],
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  advanced: {
    database: {
      // Neon Auth stores Better Auth identifiers as UUIDs.
      generateId: () => crypto.randomUUID(),
    },
    ...(process.env.NODE_ENV === 'development'
      ? { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } }
      : {}),
  },
})
