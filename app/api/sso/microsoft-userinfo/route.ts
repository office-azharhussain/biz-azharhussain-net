const microsoftUserInfoURL = 'https://graph.microsoft.com/oidc/userinfo'

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return Response.json({ error: 'missing_authorization' }, { status: 401 })
  }

  const response = await fetch(microsoftUserInfoURL, {
    headers: { authorization },
    cache: 'no-store',
  })
  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload) {
    return Response.json({ error: 'microsoft_userinfo_failed' }, { status: response.status || 502 })
  }

  return Response.json({
    ...payload,
    email: payload.email ?? payload.preferred_username ?? payload.userPrincipalName,
    sub: payload.sub ?? payload.id,
  })
}
