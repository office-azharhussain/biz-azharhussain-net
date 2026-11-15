import { betterAuth } from 'better-auth'
import { passkey } from '@better-auth/passkey'
import { emailOTP, organization, twoFactor } from 'better-auth/plugins'
import { sendInvitationEmail, sendVerificationCode } from '@/lib/mailer'
import { prismaAdapter } from '@better-auth/prisma-adapter'
import { prisma } from '@/lib/db'

const developmentOrigins = [
  'http://localhost:3000',
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
].filter((origin): origin is string => Boolean(origin))

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql', transaction: true }),
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: { enabled: true, autoSignIn: true },
  appName: 'ChargeUp',
  plugins: [
    passkey({
      rpName: 'ChargeUp',
      rpID: new URL(
        process.env.BETTER_AUTH_URL ??
          (process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000'),
      ).hostname,
      origin:
        process.env.BETTER_AUTH_URL ??
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : process.env.V0_RUNTIME_URL ?? 'http://localhost:3000'),
    }),
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 20,
      sendInvitationEmail: async ({ id, email, organization: invitedOrganization, role }) => {
        await sendInvitationEmail({ email, invitationId: id, organizationName: invitedOrganization.name, role })
      },
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 5,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === 'email-verification') await sendVerificationCode({ email, otp })
      },
    }),
    twoFactor({
      issuer: 'ChargeUp',
      accountLockout: { enabled: true, maxFailedAttempts: 5, durationSeconds: 300 },
    }),
  ],
  trustedOrigins:
    process.env.NODE_ENV === 'development'
      ? developmentOrigins
      : [
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
