'use client'

import { FormEvent, useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'

export function OrganizationSwitcher() {
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [email, setEmail] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadOrganizations() {
    const result = await authClient.organization.list()
    if (!result.error) {
      const next = result.data ?? []
      setOrganizations(next)
      setOrganizationId((current) => current || next[0]?.id || '')
    }
    setLoading(false)
  }

  useEffect(() => { void loadOrganizations() }, [])

  async function inviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !organizationId) return
    setCreating(true)
    setError('')
    setMessage('')
    const result = await authClient.organization.inviteMember({
      email: email.trim(),
      role: 'member',
      organizationId,
    })
    if (result.error) setError('We could not send that invitation. Check the email and your permissions.')
    else { setEmail(''); setMessage('Invitation sent successfully.') }
    setCreating(false)
  }

  if (loading) return <section className="rounded-2xl border border-[#dce9e5] bg-white p-6 text-sm text-[#7c9294]">Loading organization…</section>

  return <section className="rounded-2xl border border-[#dce9e5] bg-white p-5 sm:p-6">
    <div className="flex flex-col gap-2"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#16a386]">Organization</p><h2 className="text-lg font-semibold">Invite your team</h2><p className="text-sm text-[#7c9294]">Your organization has one isolated tenant workspace. Invite members to collaborate in it.</p></div>
    {organizations.length > 0 ? <form onSubmit={inviteMember} className="mt-5 flex flex-col gap-3 sm:flex-row"><select value={organizationId} onChange={(event) => setOrganizationId(event.target.value)} aria-label="Organization" className="h-11 rounded-xl border border-[#d6e6e1] bg-[#f8fbfa] px-3 text-sm">{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="Member email address" aria-label="Member email address" className="h-11 min-w-0 flex-1 rounded-xl border border-[#d6e6e1] bg-[#f8fbfa] px-3 text-sm outline-none focus:ring-2 focus:ring-[#16b995]" /><button disabled={creating} className="h-11 rounded-xl bg-[#123844] px-4 text-sm font-semibold text-white disabled:opacity-50">{creating ? 'Sending…' : 'Invite member'}</button></form> : <p className="mt-5 text-sm text-[#b42318]">No organization is available for this account.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-[#b42318]">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm text-[#168b74]">{message}</p>}
  </section>
}
