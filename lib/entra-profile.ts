import { prisma } from '@/lib/db'

export type EntraProfile = {
  displayName?: string
  jobTitle?: string | null
  department?: string | null
  mail?: string | null
  userPrincipalName?: string | null
}

type MicrosoftTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  refresh_token_expires_in?: number
}

export async function getEntraAccessToken(userId: string, forceRefresh = false) {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: { in: ['chargeup-microsoft', 'microsoft'] } },
    select: {
      id: true,
      accessToken: true,
      refreshToken: true,
      accessTokenExpiresAt: true,
      refreshTokenExpiresAt: true,
      scope: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!account) return null

  const accessTokenExpired = account.accessTokenExpiresAt !== null && account.accessTokenExpiresAt.getTime() <= Date.now() + 60_000
  if (!forceRefresh && !accessTokenExpired && account.accessToken) return account.accessToken
  if (!account.refreshToken) return null
  if (account.refreshTokenExpiresAt && account.refreshTokenExpiresAt.getTime() <= Date.now()) return null

  const tenantId = process.env.MICROSOFT_TENANT_ID
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET
  if (!tenantId || !clientId || !clientSecret) return null

  try {
    const refreshResponse = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: account.refreshToken,
        scope: account.scope || 'openid profile email offline_access User.Read Mail.Send',
      }),
      cache: 'no-store',
    })
    if (!refreshResponse.ok) return null

    const token = await refreshResponse.json() as MicrosoftTokenResponse
    if (!token.access_token) return null

    const refreshedAt = Date.now()
    try {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          accessToken: token.access_token,
          refreshToken: token.refresh_token ?? account.refreshToken,
          accessTokenExpiresAt: new Date(refreshedAt + (token.expires_in ?? 3600) * 1000),
          ...(token.refresh_token_expires_in ? { refreshTokenExpiresAt: new Date(refreshedAt + token.refresh_token_expires_in * 1000) } : {}),
        },
      })
    } catch {
      return token.access_token
    }

    return token.access_token
  } catch {
    return null
  }
}

export async function getEntraProfile(userId: string) {
  let accessToken = await getEntraAccessToken(userId)
  if (!accessToken) return null

  const fetchProfile = (token: string) => fetch('https://graph.microsoft.com/v1.0/me?$select=displayName,jobTitle,department,mail,userPrincipalName', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  try {
    let response = await fetchProfile(accessToken)
    if (response.status === 401) {
      accessToken = await getEntraAccessToken(userId, true)
      if (!accessToken) return null
      response = await fetchProfile(accessToken)
    }
    if (!response.ok) return null

    return (await response.json()) as EntraProfile
  } catch {
    return null
  }
}
