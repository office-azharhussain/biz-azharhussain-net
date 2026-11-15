import Link from 'next/link'
import type { ReactNode } from 'react'
import { Bell, ChevronDown, KeyRound, UserPlus } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { ProfileAvatar } from '@/components/profile-avatar'
import { SignOutButton } from '@/components/sign-out-button'

type DashboardPage = 'overview' | 'agents' | 'members' | 'logs'
type DashboardLayoutProps = {
  activePage: DashboardPage
  displayName: string
  designation: string
  department: string
  profileImageSrc: string | null
  children: ReactNode
  canManageMembers: boolean
}

const navigation = [
  { href: '/dashboard', label: 'Overview', page: 'overview' },
  { href: '/agents', label: 'Agents', page: 'agents' },
  { href: '/members', label: 'Members', page: 'members' },
  { href: '/logs', label: 'Audit logs', page: 'logs' },
] as const

export function DashboardLayout({ activePage, displayName, designation, department, profileImageSrc, children, canManageMembers }: DashboardLayoutProps) {
  return (
    <div className="flex h-[100svh] flex-col overflow-hidden bg-[#f5f8f8] text-[#203740] [color-scheme:light]">
      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[#dfe7e8] bg-white px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Biz home">
          <BrandLogo size={32} />
          <span className="text-lg font-semibold tracking-tight">Biz</span>
        </Link>
        <nav aria-label="Dashboard navigation" className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
          {navigation.map(({ href, label, page }) => {
            const active = activePage === page
            return <Link key={page} href={href} aria-current={active ? 'page' : undefined} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? 'bg-[#e8f5f1] text-[#087f68]' : 'text-[#61777d] hover:bg-[#f2f6f6] hover:text-[#203740]'}`}>{label}</Link>
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <button aria-label="Notifications" className="relative flex size-9 items-center justify-center rounded-full border border-[#dfe7e8] text-[#61777d] hover:bg-[#f4f7f7]"><Bell className="size-4" /><span aria-hidden="true" className="absolute right-2 top-2 size-1.5 rounded-full bg-[#13a387]" /></button>
          <details className="relative border-l border-[#dfe7e8] pl-3">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl p-1.5 outline-none transition hover:bg-[#f4f7f7] focus-visible:ring-2 focus-visible:ring-[#087f68] [&::-webkit-details-marker]:hidden">
              <ProfileAvatar imageUrl={profileImageSrc} name={displayName} />
              <div className="hidden text-right sm:block"><p className="text-xs font-semibold">{displayName}</p><p className="max-w-36 truncate text-[10px] text-[#71848a]">{designation} · {department}</p></div>
              <ChevronDown className="size-3.5 text-[#71848a]" />
            </summary>
            <div className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-[#dfe7e8] bg-white p-3 shadow-xl shadow-[#173743]/10">
              <div className="border-b border-[#e7eded] px-2 pb-3"><p className="text-sm font-semibold">{displayName}</p><p className="mt-1 text-xs text-[#71848a]">{designation}</p><p className="text-xs text-[#71848a]">{department}</p></div>
              <div className="flex flex-col gap-1 pt-3">
                {canManageMembers ? <Link href="/members#invite-guest" className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-[#536971] hover:bg-[#f4f7f7] hover:text-[#203740]"><UserPlus className="size-3.5 text-[#087f68]" />Invite guest</Link> : null}
                <Link href="/settings/security#password" className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-[#536971] hover:bg-[#f4f7f7] hover:text-[#203740]"><KeyRound className="size-3.5 text-[#087f68]" />Reset password</Link>
                <SignOutButton />
              </div>
            </div>
          </details>
        </div>
      </header>
      <main className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col overflow-y-auto px-5 py-5 pb-8 sm:px-8 lg:px-10">{children}</main>
      <footer className="shrink-0 border-t border-[#dfe7e8] bg-white px-5 py-3 text-[10px] text-[#71848a] sm:px-8 lg:px-10"><div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4"><span>Biz · Azhar Hussain</span><span>Business operations workspace</span></div></footer>
    </div>
  )
}
