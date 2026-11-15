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
  const [passkeyAvailable, setPasskeyAvailable] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [otpStep, setOtpStep] = useState(false)
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    setPasskeyAvailable(!isSignUp && typeof window !== 'undefined' && Boolean(window.PublicKeyCredential))
  }, [isSignUp])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setInterval(() => setResendCooldown((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [resendCooldown])

  async function handlePasskeySignIn() {
    setLoading(true)
    setError('')
    const result = await authClient.signIn.passkey()
    if (result.error) setError('Unable to sign in with your passkey.')
    else {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

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
      const slug = organizationName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const created = await authClient.organization.create({ name: organizationName, slug })
      let organizationId = created.data?.id
      if (created.error || !organizationId) {
        const existing = await authClient.organization.list()
        const organizations = existing.data ?? []
        const matchingOrganization = organizations.find((item) => item.slug === slug || item.name.toLowerCase() === organizationName.toLowerCase())
        organizationId = matchingOrganization?.id
        if (!organizationId) {
          console.error('[v0] Organization creation failed:', created.error)
          setError('Your email is verified, but your organization could not be created. Please contact support.')
          setLoading(false)
          return
        }
      }
      router.push(`/${encodeURIComponent(slug)}/dashboard`)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleResendCode() {
    if (resendCooldown > 0) return
    setLoading(true)
    setError('')
    try { await sendEmailCode(verificationEmail) } catch { setError('We could not send a new code. Please try again.') }
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
      if (isSignUp && ['USER_ALREADY_EXISTS', 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL', 'EMAIL_ALREADY_EXISTS'].includes(errorCode)) {
        setError('An account already exists for this email. Try signing in instead.')
      } else if (!isSignUp && ['INVALID_EMAIL_OR_PASSWORD', 'INVALID_PASSWORD'].includes(errorCode)) {
        setError('The email or password is incorrect. Please try again.')
      } else if (errorCode === 'REQUEST_TIMEOUT') {
        setError('The request took too long. Please try again.')
      } else {
        setError('We could not complete that request. Please check your details and try again.')
      }
    } else if (isSignUp) {
      const email = String(form.get('email'))
      try {
        await sendEmailCode(email)
        setVerificationEmail(email)
        setSignupPassword(String(form.get('password')))
        setOrganizationName(String(form.get('organizationName')))
        setOtpStep(true)
      } catch (error) {
        console.error('[v0] Email verification code request failed:', error)
        setError('Your account was created, but we could not send the verification code. Please check your email settings or try again.')
      }
    } else if ((result.data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
      router.push('/two-factor')
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
    return <form onSubmit={handleVerifyEmail} className="flex flex-col gap-3 text-[#122c35] [color-scheme:light] sm:gap-4">
      <div className="rounded-2xl border border-[#d6e6e1] bg-[#f3f8f6] p-4"><p className="text-sm font-semibold">Check your inbox</p><p className="mt-1 text-sm leading-6 text-[#557078]">We sent a 6-digit code to <strong>{verificationEmail}</strong>.</p></div>
      <label className="flex flex-col gap-2 text-sm font-medium">Verification code<input name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\\D/g, '').slice(0, 6))} className="h-14 rounded-xl border border-[#cfe0db] bg-[#f8fbfa] px-4 text-center font-mono text-2xl tracking-[0.35em] text-[#123844] outline-none focus:ring-2 focus:ring-[#16b995]" placeholder="000000" /></label>
      {error && <p role="alert" className="rounded-lg bg-[#fff1f0] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
      <button disabled={loading} className="h-12 rounded-xl bg-[#123844] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">{loading ? 'Verifying…' : 'Verify email'}</button>
      <button type="button" onClick={handleResendCode} disabled={loading || resendCooldown > 0} className="h-11 rounded-xl border border-[#cfe0db] bg-white font-semibold text-[#123844] hover:bg-[#eef8f4] disabled:opacity-50">{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}</button>
    </form>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-[#122c35] [color-scheme:light] sm:gap-4">
      {isSignUp && !invitationId && <label className="flex flex-col gap-2 text-sm font-medium">Organization name<input name="organizationName" required className="h-10 rounded-xl border border-[#d6e6e1] sm:h-12 bg-[#f8fbfa] px-4 outline-none ring-offset-background placeholder:text-[#91a5a8] focus:ring-2 focus:ring-[#16b995]" placeholder="Acme Inc." /></label>}
      {isSignUp && <label className="flex flex-col gap-2 text-sm font-medium">Name<input name="name" required className="h-10 rounded-xl border border-[#d6e6e1] sm:h-12 bg-[#f8fbfa] px-4 outline-none ring-offset-background placeholder:text-[#91a5a8] focus:ring-2 focus:ring-[#16b995]" placeholder="Alex Morgan" /></label>}
      <label className="flex flex-col gap-2 text-sm font-medium">Email<input name="email" type="email" required className="h-10 rounded-xl border border-[#d6e6e1] sm:h-12 bg-[#f8fbfa] px-4 outline-none ring-offset-background placeholder:text-[#91a5a8] focus:ring-2 focus:ring-[#16b995]" placeholder="you@company.com" /></label>
      <label className="flex flex-col gap-2 text-sm font-medium">Password<input name="password" type="password" minLength={8} required className="h-10 rounded-xl border border-[#d6e6e1] sm:h-12 bg-[#f8fbfa] px-4 outline-none ring-offset-background placeholder:text-[#91a5a8] focus:ring-2 focus:ring-[#16b995]" placeholder="At least 8 characters" /></label>
      {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <p className="rounded-lg border border-[#d6e6e1] bg-[#f3f8f6] px-3 py-2 text-xs leading-5 text-[#557078]">{isSignUp ? 'After creating your account, set up two-factor authentication from your dashboard.' : 'If two-factor authentication is enabled, you will be asked for your authenticator code next.'}</p>
      <button disabled={loading} className="h-12 rounded-xl bg-[#123844] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">{loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}</button>
      {passkeyAvailable && <><div className="flex items-center gap-3 text-xs text-[#7b9292]"><span className="h-px flex-1 bg-[#d6e6e1]" />or<span className="h-px flex-1 bg-[#d6e6e1]" /></div><button type="button" onClick={handlePasskeySignIn} disabled={loading} className="h-12 rounded-xl border border-[#cfe0db] bg-white font-semibold text-[#123844] transition-colors hover:bg-[#eef8f4] disabled:opacity-50">Sign in with a passkey</button></>}
      <p className="text-center text-sm text-[#557078]">{isSignUp ? 'Already have an account?' : 'New to ChargeUp?'} <Link className="font-semibold text-foreground underline underline-offset-4" href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create an account'}</Link></p>
    </form>
  )
}
