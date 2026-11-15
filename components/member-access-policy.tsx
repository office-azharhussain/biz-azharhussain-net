'use client'

import { Check, CircleMinus, ShieldCheck } from 'lucide-react'
import { organizationRolePolicies } from '@/lib/organization-access'

const allCapabilities = [
  'View directory',
  'Invite members',
  'Change roles',
  'Remove members',
  'Owner controls',
] as const

export function MemberAccessPolicy() {
  return (
    <section aria-labelledby="access-policy-title" className="rounded-2xl border border-[#dfe7e8] bg-white p-5 shadow-sm shadow-[#173743]/[0.03] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5f1] text-[#087f68]">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="access-policy-title" className="text-base font-semibold text-[#203740]">Access policy</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#71848a]">Organization permissions are enforced on the server and reflected here for each built-in role.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {organizationRolePolicies.map((policy) => (
          <article key={policy.role} className="rounded-xl border border-[#e7eded] bg-[#fbfcfc] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#203740]">{policy.label}</h3>
              <span className="rounded-full bg-[#e8f5f1] px-2 py-1 text-[10px] font-semibold text-[#087f68]">Role</span>
            </div>
            <p className="mt-2 min-h-10 text-xs leading-5 text-[#71848a]">{policy.summary}</p>
            <ul className="mt-3 flex flex-col gap-2" aria-label={`${policy.label} permissions`}>
              {allCapabilities.map((capability) => {
                const granted = policy.permissions.some((permission) => permission === capability)
                return (
                  <li key={capability} className="flex items-center gap-2 text-[11px] text-[#536971]">
                    {granted ? <Check className="size-3.5 text-[#087f68]" aria-label="Allowed" /> : <CircleMinus className="size-3.5 text-[#a0afb2]" aria-label="Not allowed" />}
                    <span>{capability}</span>
                  </li>
                )
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
