'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Check, ChevronDown, Loader2, Mail, Search, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ProfileAvatar } from '@/components/profile-avatar'

export type MemberRole = 'owner' | 'admin' | 'member' | 'guest'
export type MemberRow = { id: string; userId: string; name: string; email: string; image: string | null; designation: string; department: string; role: MemberRole; source: string; joinedAt: string }

const roleLabels: Record<MemberRole, string> = { owner: 'Owner', admin: 'Admin', member: 'Member', guest: 'Guest' }

export function MemberTable({ members, currentUserId, organizationId, canManage, canAssignOwner }: { members: MemberRow[]; currentUserId: string; organizationId: string; canManage: boolean; canAssignOwner: boolean }) {
  const router = useRouter()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [inviting, setInviting] = useState(false)
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'organization' | 'guests'>('organization')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [roleError, setRoleError] = useState('')
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const organizationMembers = members.filter((member) => member.role !== 'guest')
  const guestMembers = members.filter((member) => member.role === 'guest')
  const visibleMembers = activeTab === 'guests' ? guestMembers : organizationMembers
  const filtered = visibleMembers.filter((member) => `${member.name} ${member.email} ${member.designation} ${member.department} ${member.role}`.toLowerCase().includes(query.toLowerCase()))

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = activeTab === 'organization' ? 0 : 1
    const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % 2 : event.key === 'ArrowLeft' ? (currentIndex + 1) % 2 : event.key === 'Home' ? 0 : event.key === 'End' ? 1 : -1
    if (nextIndex === -1) return
    event.preventDefault()
    const nextTab = nextIndex === 0 ? 'organization' : 'guests'
    setActiveTab(nextTab)
    tabRefs.current[nextIndex]?.focus()
  }

  async function inviteGuest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteMessage('')
    setInviteError('')
    setInviteUrl('')
    const result = await fetch('/api/organizations/invitations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ organizationId, email: inviteEmail.trim() }) })
    const payload = await result.json().catch(() => null)
    if (!result.ok) setInviteError(payload?.error ?? 'We could not create this invitation.')
    else { setInviteEmail(''); setInviteMessage(payload?.message ?? 'Guest invitation created.'); setInviteUrl(payload?.inviteUrl ?? '') }
    setInviting(false)
  }

  function changeRole(memberId: string, role: MemberRole) {
    setPendingId(memberId)
    setRoleError('')
    startTransition(async () => {
      try {
        const response = await fetch('/api/members/role', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ memberId, role }) })
        const payload = await response.json().catch(() => null)
        if (response.ok) router.refresh()
        else setRoleError(payload?.error ?? 'We could not update this role.')
      } catch {
        setRoleError('We could not update this role. Check your connection and try again.')
      } finally {
        setPendingId(null)
      }
    })
  }

  async function removeMember(memberId: string) {
    setPendingId(memberId)
    setRoleError('')
    try {
      const response = await fetch('/api/members/remove', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ memberId }) })
      const payload = await response.json().catch(() => null)
      if (response.ok) {
        setConfirmRemoveId(null)
        router.refresh()
      } else setRoleError(payload?.error ?? 'We could not remove this member.')
    } catch {
      setRoleError('We could not remove this member. Check your connection and try again.')
    } finally {
      setPendingId(null)
    }
  }

  return <section className="mt-8 overflow-visible rounded-2xl border border-white/10 bg-[#101c27]">
    <div role="tablist" aria-label="Member groups" onKeyDown={handleTabKeyDown} className="flex gap-6 border-b border-white/10 px-4 sm:px-6">
      <button ref={(element) => { tabRefs.current[0] = element }} id="organization-tab" type="button" role="tab" aria-selected={activeTab === 'organization'} aria-controls="members-tab-panel" tabIndex={activeTab === 'organization' ? 0 : -1} onClick={() => setActiveTab('organization')} className={`border-b-2 py-4 text-xs font-semibold transition ${activeTab === 'organization' ? 'border-[var(--mint)] text-white' : 'border-transparent text-white/45 hover:text-white'}`}>
        Organization <span className="ml-2 rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-white/65">{organizationMembers.length}</span>
      </button>
      <button ref={(element) => { tabRefs.current[1] = element }} id="guests-tab" type="button" role="tab" aria-selected={activeTab === 'guests'} aria-controls="members-tab-panel" tabIndex={activeTab === 'guests' ? 0 : -1} onClick={() => setActiveTab('guests')} className={`border-b-2 py-4 text-xs font-semibold transition ${activeTab === 'guests' ? 'border-[var(--mint)] text-white' : 'border-transparent text-white/45 hover:text-white'}`}>
        Guests <span className="ml-2 rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-white/65">{guestMembers.length}</span>
      </button>
    </div>
    <div role="tabpanel" id="members-tab-panel" aria-labelledby={`${activeTab}-tab`} tabIndex={0}>
    {roleError ? <p role="alert" className="border-b border-red-400/20 bg-red-500/10 px-4 py-3 text-xs text-red-200 sm:px-6">{roleError}</p> : null}
    {canManage && activeTab === 'guests' ? <div id="invite-guest" className="scroll-mt-20 border-b border-white/10 p-4 sm:p-6"><div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--mint)]/10 text-[var(--mint)]"><Mail className="size-4" /></div><div><h2 className="text-sm font-semibold">Invite a guest</h2><p className="mt-1 text-xs text-white/40">Send an invitation link with the Guest role.</p></div></div><form onSubmit={inviteGuest} className="mt-4 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="guest-email">Guest email address</label><input id="guest-email" type="email" required value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="guest@example.com" className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs text-white outline-none placeholder:text-white/30 focus:border-[var(--mint)]" /><button type="submit" disabled={inviting} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#123844] px-4 text-xs font-semibold text-white hover:bg-[#164b4a] disabled:opacity-50">{inviting && <Loader2 className="size-3.5 animate-spin" />}{inviting ? 'Inviting…' : 'Invite guest'}</button></form>{inviteError && <p role="alert" className="mt-2 text-xs text-red-300">{inviteError}</p>}{inviteMessage && <p role="status" className="mt-2 text-xs text-[var(--mint)]">{inviteMessage}</p>}{inviteUrl && <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input readOnly value={inviteUrl} aria-label="Guest invitation link" className="h-9 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/10 px-3 text-[11px] text-white/60 outline-none" /><button type="button" onClick={() => void navigator.clipboard.writeText(inviteUrl)} className="h-9 rounded-lg border border-white/10 px-3 text-xs font-semibold text-white/70 hover:bg-white/[0.06]">Copy link</button></div>}</div> : null}
    <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="text-sm font-semibold">{activeTab === 'guests' ? 'Guest members' : 'Organization members'}</h2><p className="mt-1 text-xs text-white/40">{activeTab === 'guests' ? 'People with guest access to this organization.' : 'Microsoft 365 users are tagged automatically.'}</p></div><label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/50"><Search className="size-3.5" /><span className="sr-only">Search members</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members" className="w-full bg-transparent outline-none placeholder:text-white/30 sm:w-48" /></label></div>
    <div className="hidden grid-cols-[1fr_150px_150px_120px_120px_auto] gap-4 border-b border-white/10 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 md:grid"><span>Member</span><span>Designation</span><span>Department</span><span>Source</span><span>Role</span>{canManage ? <span>Actions</span> : null}</div>
    <div className="divide-y divide-white/10">{filtered.length === 0 ? <p className="px-6 py-16 text-center text-sm text-white/45">{activeTab === 'guests' ? 'No guests match your search.' : 'No members match your search.'}</p> : filtered.map((member) => <article key={member.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_150px_150px_120px_120px_auto] md:items-center md:gap-4 md:px-6"><div className="flex min-w-0 items-center gap-3"><ProfileAvatar imageUrl={member.image} name={member.name} className="size-9" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{member.name}{member.userId === currentUserId ? <span className="ml-2 text-[10px] font-normal text-white/35">You</span> : null}</p><p className="truncate text-xs text-white/40">{member.email}</p></div></div><div className="min-w-0"><p className="truncate text-xs text-white/70">{member.designation}</p><p className="text-[10px] text-white/35">Designation</p></div><div className="min-w-0"><p className="truncate text-xs text-white/70">{member.department}</p><p className="text-[10px] text-white/35">Department</p></div><span className="w-fit rounded-full bg-[var(--mint)]/10 px-2.5 py-1 text-[10px] font-semibold text-[var(--mint)]">{member.source}</span><div className="flex items-center gap-2"><RoleSelect role={member.role} disabled={!canManage || pendingId === member.id || (isPending && pendingId === member.id) || member.userId === currentUserId || (!canAssignOwner && member.role === 'owner')} canAssignOwner={canAssignOwner} onChange={(role) => changeRole(member.id, role)} />{canManage ? <div className="flex items-center gap-1">{confirmRemoveId === member.id ? <><button type="button" disabled={pendingId === member.id} onClick={() => void removeMember(member.id)} className="rounded-md px-2 py-1.5 text-[10px] font-semibold text-red-200 hover:bg-red-400/10 disabled:opacity-50">Remove</button><button type="button" onClick={() => setConfirmRemoveId(null)} className="rounded-md p-1.5 text-white/45 hover:bg-white/[0.06]" aria-label={`Cancel removing ${member.name}`}><X className="size-3.5" /></button></> : <button type="button" disabled={pendingId === member.id || member.userId === currentUserId || (!canAssignOwner && member.role === 'owner')} onClick={() => setConfirmRemoveId(member.id)} className="rounded-md p-2 text-white/40 transition hover:bg-red-400/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Remove ${member.name}`}><Trash2 className="size-3.5" /></button>}</div> : null}</div></article>)}</div>
    </div>
  </section>
}

function RoleSelect({ role, disabled, canAssignOwner, onChange }: { role: MemberRole; disabled: boolean; canAssignOwner: boolean; onChange: (role: MemberRole) => void }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) menuRef.current?.scrollIntoView({ block: 'nearest' })
  }, [open])

  return <div className="relative w-fit"><button type="button" disabled={disabled} onClick={() => setOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50">{disabled && <Loader2 className="size-3 animate-spin" />}{roleLabels[role]}<ChevronDown className="size-3 text-white/40" /></button>{open && !disabled ? <div ref={menuRef} className="absolute right-0 top-9 z-10 w-32 rounded-xl border border-white/10 bg-[#142432] p-1 shadow-2xl">{(Object.keys(roleLabels) as MemberRole[]).filter((option) => canAssignOwner || option !== 'owner').map((option) => <button key={option} type="button" onClick={() => { setOpen(false); onChange(option) }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-white/70 hover:bg-white/[0.06]">{roleLabels[option]}{option === role && <Check className="size-3.5 text-[var(--mint)]" />}</button>)}</div> : null}</div>
}
