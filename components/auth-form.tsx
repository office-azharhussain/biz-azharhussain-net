'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationId = searchParams.get('invitationId')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isSignUp = mode === 'sign-up'
  const [verificationEmail, setVerificationEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [verificationMode, setVerificationMode] = useState<'sign-in' | 'sign-up'>('sign-up')
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setInterval(() => setResendCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [resendCooldown])

  async function sendEmailCode(email: string) {
    const result = await authClient.emailOtp.sendVerificationOtp({ email, type: 'email-verification' })
    if (result.error) throw new Error('OTP_SEND_FAILED')
    setResendCooldown(30)
  }

  async function handleVerifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const result = await authClient.emailOtp.verifyEmail({ email: verificationEmail, otp })
    if (result.error) setError('That code is invalid or expired. Request a new code and try again.')
    else {
      const signedIn = await authClient.signIn.email({ email: verificationEmail, password: signupPassword })
      if (signedIn.error) {
        console.error('[v0] Session restoration after email verification failed:', signedIn.error)
        setError('Your email is verified, but we could not start your session. Please sign in and try again.')
        setLoading(false)
        return
      }
      if ((signedIn.data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
        router.push(invitationId ? `/two-factor?invitationId=${encodeURIComponent(invitationId)}` : '/two-factor')
        router.refresh()
        setLoading(false)
        return
      }
      if (invitationId) {
        const invitation = await authClient.organization.getInvitation({ query: { id: invitationId } })
        const accepted = await authClient.organization.acceptInvitation({ invitationId })
        const joinedOrganizations = await authClient.organization.list()
        const organizationId = accepted.data?.member?.organizationId ?? invitation.data?.organizationId
        const joined = joinedOrganizations.data?.find((item) => item.id === organizationId)
        if (accepted.error && !joined) {
          setError('Your account was created, but the invitation could not be accepted. Open the invitation link again after signing in.')
          setLoading(false)
          return
        }
        router.push(joined?.slug ? `/${encodeURIComponent(joined.slug)}/dashboard` : '/dashboard')
        router.refresh()
        return
      }
      if (verificationMode === 'sign-in') {
        const organizations = await authClient.organization.list()
        const organization = organizations.data?.[0]
        router.push(organization?.slug ? `/${encodeURIComponent(organization.slug)}/dashboard` : '/dashboard')
        router.refresh()
        return
      }
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  async function handleResendCode() {
    if (resendCooldown > 0) return
    setLoading(true)
    setError('')
    try { await sendEmailCode(verificationEmail) } catch { setError('Microsoft Graph could not send a new code. The sending mailbox must be enabled and the app must have Mail.Send application permission with admin consent.') }
    setLoading(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if ((event.nativeEvent as KeyboardEvent).isComposing || (event as unknown as KeyboardEvent).keyCode === 229) return
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const request = isSignUp
      ? authClient.signUp.email({ name: String(form.get('name')), email: String(form.get('email')), password: String(form.get('password')) })
      : authClient.signIn.email({ email: String(form.get('email')), password: String(form.get('password')) })
    const timeout = new Promise<{ error: { code: string }; data: null }>((resolve) => setTimeout(() => resolve({ error: { code: 'REQUEST_TIMEOUT' }, data: null }), 15000))
    const result = await Promise.race([request, timeout])
    if (result.error) {
      const errorCode = result.error.code ?? ''
      if (!isSignUp && errorCode === 'EMAIL_NOT_VERIFIED') {
        setVerificationEmail(String(form.get('email')))
        setSignupPassword(String(form.get('password')))
        setVerificationMode('sign-in')
        setOtp('')
        setResendCooldown(30)
        setOtpStep(true)
      } else if (isSignUp && ['USER_ALREADY_EXISTS', 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL', 'EMAIL_ALREADY_EXISTS'].includes(errorCode)) {
        setError('An account already exists for this email. Try signing in instead.')
      } else if (!isSignUp && ['INVALID_EMAIL_OR_PASSWORD', 'INVALID_PASSWORD'].includes(errorCode)) {
        setError('The email or password is incorrect. Please try again.')
      } else if (errorCode === 'REQUEST_TIMEOUT') {
        setError('The request took too long. Please try again.')
      } else {
        setError('We could not complete that request. Please check your details and try again.')
      }
    } else if (isSignUp) {
      setVerificationEmail(String(form.get('email')))
      setSignupPassword(String(form.get('password')))
      setVerificationMode('sign-up')
      setResendCooldown(30)
      setOtpStep(true)
    } else if ((result.data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
      router.push(invitationId ? `/two-factor?invitationId=${encodeURIComponent(invitationId)}` : '/two-factor')
    } else {
      if (invitationId) {
        const invitation = await authClient.organization.getInvitation({ query: { id: invitationId } })
        const accepted = await authClient.organization.acceptInvitation({ invitationId })
        const joinedOrganizations = await authClient.organization.list()
        const organizationId = accepted.data?.member?.organizationId ?? invitation.data?.organizationId
        const joined = joinedOrganizations.data?.find((item) => item.id === organizationId)
        if (accepted.error && !joined) {
          setError('You are signed in, but this invitation could not be accepted. Make sure you used the invited email address.')
          setLoading(false)
          return
        }
        router.push(joined?.slug ? `/${encodeURIComponent(joined.slug)}/dashboard` : '/dashboard')
        router.refresh()
        return
      }
      const organizations = await authClient.organization.list()
      const organization = organizations.data?.[0]
      router.push(organization?.slug ? `/${encodeURIComponent(organization.slug)}/dashboard` : '/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  if (otpStep) {
    return <form onSubmit={handleVerifyEmail} className="auth-form flex flex-col gap-2 text-slate-700 [color-scheme:light] sm:gap-3">
      <div className="rounded-2xl border border-[#dfe7e8] bg-[#f6f9f8] p-4"><p className="text-sm font-semibold">Verify your email</p><p className="mt-1 text-sm leading-6 text-slate-500">We sent a 6-digit code to <strong>{verificationEmail}</strong>. Verify your address before signing in and joining your organization.</p></div>
      <label className="flex flex-col gap-2 text-sm font-medium">Verification code<input name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} className="h-14 rounded-xl border border-[#dfe7e8] bg-white px-4 text-center font-mono text-2xl tracking-[0.35em] text-[#123844] outline-none focus:ring-2 focus:ring-[#16b995]" placeholder="000000" /></label>
      {error && <p role="alert" className="rounded-lg bg-[#fff1f0] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
      <button disabled={loading} className="h-10 rounded-xl bg-[#087f68] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">{loading ? 'Verifying…' : 'Verify email'}</button>
      <button type="button" onClick={handleResendCode} disabled={loading || resendCooldown > 0} className="h-11 rounded-xl border border-[#dfe7e8] bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}</button>
    </form>
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form flex flex-col gap-2 text-slate-700 [color-scheme:light] sm:gap-3">
      {isSignUp && <label className="flex flex-col gap-2 text-sm font-medium">Name<input name="name" required className="h-9 rounded-xl border border-[#dfe7e8] sm:h-10 bg-white px-4 outline-none ring-offset-background placeholder:text-[#91a5a8] focus:ring-2 focus:ring-[#16b995]" placeholder="Alex Morgan" /></label>}
      <label className="flex flex-col gap-2 text-sm font-medium">Email<input name="email" type="email" required className="h-9 rounded-xl border border-[#dfe7e8] sm:h-10 bg-white px-4 outline-none ring-offset-background placeholder:text-[#91a5a8] focus:ring-2 focus:ring-[#16b995]" placeholder="you@company.com" /></label>
      <label className="flex flex-col gap-2 text-sm font-medium">Password<input name="password" type="password" minLength={8} required className="h-9 rounded-xl border border-[#dfe7e8] sm:h-10 bg-white px-4 outline-none ring-offset-background placeholder:text-[#91a5a8] focus:ring-2 focus:ring-[#16b995]" placeholder="At least 8 characters" /></label>
      {!isSignUp && <div className="flex justify-end"><Link href="/forgot-password" className="text-xs font-semibold text-[var(--mint)] transition-colors hover:text-white">Forgot password?</Link></div>}
      {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <p className="rounded-lg border border-[#dfe7e8] bg-[#f6f9f8] px-3 py-2 text-xs leading-5 text-slate-500">{isSignUp ? invitationId ? 'Verify your email to continue and finish joining your organization.' : 'After creating your account, set up two-factor authentication from your dashboard.' : 'If two-factor authentication is enabled, you will be asked for your authenticator code next.'}</p>
      <button disabled={loading} className="h-10 rounded-xl bg-[#087f68] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">{loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in with email'}</button>
      {!isSignUp && <><div className="flex items-center gap-3 text-xs text-[#7b9292]"><span className="h-px flex-1 bg-[#dfe7e8]" />or<span className="h-px flex-1 bg-[#dfe7e8]" /></div><button type="button" onClick={async () => { setLoading(true); setError(''); const result = await authClient.signIn.social({ provider: 'microsoft', callbackURL: '/dashboard' }); if (result.error) setError('Microsoft sign-in is unavailable right now. Please try again or use email.'); setLoading(false) }} disabled={loading} className="flex h-12 items-center justify-center gap-3 rounded-xl border border-[#dfe7e8] bg-white font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"><span aria-hidden="true" className="grid size-4 grid-cols-2 gap-0.5"><span className="bg-[#f35325]" /><span className="bg-[#81bc06]" /><span className="bg-[#05a6f0]" /><span className="bg-[#ffba08]" /></span>Continue with Microsoft 365</button></>}
    </form>
  )
}
