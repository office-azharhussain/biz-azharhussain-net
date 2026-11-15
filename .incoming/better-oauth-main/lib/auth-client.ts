'use client'

import { createAuthClient } from 'better-auth/react'
import { passkeyClient } from '@better-auth/passkey/client'
import { emailOTPClient, organizationClient, twoFactorClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  plugins: [
    passkeyClient(),
    organizationClient(),
    emailOTPClient(),
    twoFactorClient({
      twoFactorPage: '/two-factor',
    }),
  ],
})
