'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { authClient } from '@/lib/auth-client'

const inputClassName = 'h-11 rounded-xl border border-white/15 bg-white/[0.08] px-4 text-sm text-white outline-none placeholder:text-[#91a5a8] focus:ring-2 focus:ring-[#16b995]'
const buttonClassName = 'h-11 rounded-xl bg-[#123844] px-4 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: new URL('/reset-password', window.location.origin).toString(),
      })
      if (result.error) setError('We could not start password recovery right now. Please try again.')
      else setSubmitted(true)
    } catch {
      setError('We could not start password recovery right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return <div className="flex flex-col gap-4 text-sm text-white/70">
      <p role="status" className="rounded-xl border border-[var(--mint)]/20 bg-[var(--mint)]/10 p-4 leading-6">If an email/password account exists for that address, a secure reset link will arrive shortly.</p>
      <Link href="/sign-in" className="text-center text-xs font-semibold text-[var(--mint)] hover:text-white">Back to sign in</Link>
    </div>
  }

  return <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-white/80 [color-scheme:dark]">
    <label className="flex flex-col gap-2 text-sm font-medium">Email address<input name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={inputClassName} placeholder="you@company.com" /></label>
    <p className="text-xs leading-5 text-white/45">We will only confirm the request, not whether an account exists.</p>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
    <button type="submit" disabled={loading} className={buttonClassName}>{loading ? 'Sending…' : 'Send reset link'}</button>
    <Link href="/sign-in" className="text-center text-xs font-semibold text-[var(--mint)] hover:text-white">Back to sign in</Link>
  </form>
}

export function ResetPasswordForm({ token, invalidToken = false }: { token: string | null; invalidToken?: boolean }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) {
      setError('This reset link is invalid or expired. Request a new one to continue.')
      return
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await authClient.resetPassword({ newPassword: password, token })
      if (result.error) setError('This reset link is invalid or expired. Request a new one to continue.')
      else setCompleted(true)
    } catch {
      setError('We could not reset your password right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (completed) {
    return <div className="flex flex-col gap-4 text-sm text-white/70">
      <p role="status" className="rounded-xl border border-[var(--mint)]/20 bg-[var(--mint)]/10 p-4 leading-6">Your password has been reset. Sign in with your new password.</p>
      <Link href="/sign-in" className="text-center text-xs font-semibold text-[var(--mint)] hover:text-white">Continue to sign in</Link>
    </div>
  }

  if (!token || invalidToken) {
    return <div className="flex flex-col gap-4 text-sm text-white/70">
      <p role="alert" className="rounded-xl border border-white/10 bg-white/[0.04] p-4 leading-6">This reset link is invalid or expired. Request a new one to continue.</p>
      <Link href="/forgot-password" className="text-center text-xs font-semibold text-[var(--mint)] hover:text-white">Request a new reset link</Link>
    </div>
  }

  return <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-white/80 [color-scheme:dark]">
    <label className="flex flex-col gap-2 text-sm font-medium">New password<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} className={inputClassName} placeholder="At least 8 characters" /></label>
    <label className="flex flex-col gap-2 text-sm font-medium">Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClassName} placeholder="Enter your new password again" /></label>
    {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
    <button type="submit" disabled={loading} className={buttonClassName}>{loading ? 'Resetting…' : 'Set new password'}</button>
  </form>
}
