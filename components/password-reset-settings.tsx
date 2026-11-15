'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

export function PasswordResetSettings({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function sendResetLink() {
    setState('sending')
    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: new URL('/reset-password', window.location.origin).toString(),
      })
      setState(result.error ? 'error' : 'sent')
    } catch {
      setState('error')
    }
  }

  return (
    <section id="password" aria-labelledby="password-reset-title" className="rounded-2xl border border-white/10 bg-[#101c27] p-6">
      <h2 id="password-reset-title" className="text-lg font-semibold">Password</h2>
      <p className="mt-2 text-sm leading-6 text-white/50">Send a secure password reset link to your account email.</p>
      <button type="button" onClick={sendResetLink} disabled={state === 'sending'} className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#123844] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">{state === 'sending' ? 'Sending…' : state === 'sent' ? 'Send another link' : 'Send reset link'}</button>
      {state === 'sent' && <p role="status" className="mt-3 text-xs leading-5 text-[var(--mint)]">If your account supports email/password sign-in, a reset link will arrive shortly.</p>}
      {state === 'error' && <p role="alert" className="mt-3 text-xs leading-5 text-red-300">We could not start password recovery right now. Please try again.</p>}
    </section>
  )
}
