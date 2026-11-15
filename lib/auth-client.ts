'use client'

import { createAuthClient } from 'better-auth/react'
import { ssoClient } from '@better-auth/sso/client'
import { passkeyClient } from '@better-auth/passkey/client'
import { emailOTPClient, organizationClient, twoFactorClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [
    ssoClient(),
    passkeyClient(),
    organizationClient(),
    emailOTPClient(),
    twoFactorClient({
      twoFactorPage: '/two-factor',
    }),
  ],
})
