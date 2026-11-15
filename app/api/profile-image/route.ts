import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getEntraAccessToken } from '@/lib/entra-profile'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return new Response('Unauthorized', { status: 401 })

  const requestedUserId = new URL(request.url).searchParams.get('userId') ?? session.user.id
  const requestedMember = await prisma.member.findFirst({
    where: { userId: requestedUserId, organization: { members: { some: { userId: session.user.id } } } },
    select: { userId: true },
  })
  if (!requestedMember) return new Response('Forbidden', { status: 403 })

  let accessToken = await getEntraAccessToken(requestedUserId)
  if (!accessToken) return new Response('Profile photo unavailable', { status: 404 })

  const fetchPhoto = (token: string) => fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  try {
    let response = await fetchPhoto(accessToken)
    if (response.status === 401) {
      accessToken = await getEntraAccessToken(requestedUserId, true)
      if (!accessToken) return new Response('Profile photo unavailable', { status: 404 })
      response = await fetchPhoto(accessToken)
    }

    if (!response.ok || !response.body) return new Response('Profile photo unavailable', { status: 404 })

    const contentType = response.headers.get('content-type') ?? 'image/jpeg'
    if (!contentType.toLowerCase().startsWith('image/')) return new Response('Profile photo unavailable', { status: 404 })

    return new Response(response.body, {
      headers: {
        'Cache-Control': 'private, max-age=3600',
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Profile photo unavailable', { status: 404 })
  }
}
