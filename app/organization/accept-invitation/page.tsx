'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, Users } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { BrandLogo } from '@/components/brand-logo'

function InvitationContent() {
  const params = useSearchParams()
  const router = useRouter()
  const invitationId = params.get('id') ?? ''
  const session = authClient.useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState(false)

  async function acceptInvitation() {
    if (!invitationId) return setError('This invitation link is missing its invitation ID.')
    if (!session.data?.user) {
      router.push(`/sign-in?invitationId=${encodeURIComponent(invitationId)}`)
      return
    }
    setLoading(true)
    setError('')
    const invitation = await authClient.organization.getInvitation({ query: { id: invitationId } })
    const result = await authClient.organization.acceptInvitation({ invitationId })
    const organizationId = result.data?.member?.organizationId ?? invitation.data?.organizationId
    const organizations = await authClient.organization.list()
    const joined = organizations.data?.find((item) => item.id === organizationId)
    if (result.error && !joined) setError('We could not accept this invitation. Sign in with the invited email and try again.')
    else {
      setAccepted(true)
      router.push(joined?.slug ? `/${encodeURIComponent(joined.slug)}/dashboard` : '/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#f5f8f8] px-5 py-8 text-[#203740]"><section className="w-full max-w-md rounded-3xl border border-[#dfe7e8] bg-white p-8 text-center shadow-xl shadow-[#173743]/10"><BrandLogo size={42} className="mx-auto" /><div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#e8f6f2] text-[#138e75]">{accepted ? <CheckCircle2 className="size-7" /> : <Users className="size-7" />}</div><h1 className="mt-6 text-2xl font-semibold">{accepted ? 'You joined the organization' : 'Join your organization'}</h1><p className="mt-3 text-sm leading-6 text-[#60747c]">{accepted ? 'Redirecting you to your shared ChargeUp AI Lab workspace.' : 'Accept this invitation to collaborate in the same organization workspace.'}</p>{error && <p role="alert" className="mt-4 rounded-xl bg-[#ffebeb] px-4 py-3 text-sm text-[#b42318]">{error}</p>}<button onClick={acceptInvitation} disabled={loading || accepted} className="mt-6 h-12 w-full rounded-xl bg-[#123844] px-4 text-sm font-semibold text-white transition hover:bg-[#164b4a] disabled:opacity-50">{loading ? 'Joining…' : session.data?.user ? 'Accept invitation' : 'Sign in to accept'}</button><p className="mt-5 text-sm text-[#7c9294]">Need an account? <Link href={`/sign-up?invitationId=${encodeURIComponent(invitationId)}`} className="font-semibold text-[#138e75] hover:underline">Create one first</Link></p></section></main>
}

export default function AcceptInvitationPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#f7f9f8] text-sm text-[#60747c]">Loading invitation…</main>}><InvitationContent /></Suspense>
}
