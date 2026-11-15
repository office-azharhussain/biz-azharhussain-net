'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { authClient } from '@/lib/auth-client'

export function TwoFactorSettings() {
  const [password, setPassword] = useState('')
  const [setup, setSetup] = useState<{ totpURI: string; backupCodes: string[] } | null>(null)
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const enabled = Boolean(session?.user?.twoFactorEnabled)

  async function enable() {
    setLoading(true); setError('')
    const result = await authClient.twoFactor.enable({ password })
    if (result.error) setError(result.error.message || 'Unable to start 2FA setup.')
    else if (result.data.method === 'totp') { setSetup({ totpURI: result.data.totpURI, backupCodes: result.data.backupCodes }); setPassword(''); setVerificationCode('') }
    else setError('This account uses a different two-factor method.')
    setLoading(false)
  }

  async function confirmSetup() {
    if (!setup || !/^[0-9]{6}$/.test(verificationCode)) {
      setError('Enter the 6-digit code from your authenticator app.')
      return
    }

    setLoading(true)
    setError('')
    const result = await authClient.twoFactor.verifyTotp({ code: verificationCode })
    if (result.error) setError(result.error.message || 'That code is incorrect or expired.')
    else { setSetup(null); setVerificationCode(''); router.refresh() }
    setLoading(false)
  }

  function cancelSetup() {
    setSetup(null)
    setVerificationCode('')
    setError('')
  }

  async function disable() {
    setLoading(true); setError('')
    const result = await authClient.twoFactor.disable({ password })
    if (result.error) setError(result.error.message || 'Unable to disable 2FA.')
    else { setSetup(null); setPassword(''); router.refresh() }
    setLoading(false)
  }

  return <article className="rounded-[1.5rem] border border-[#d6e6e1] bg-white p-6 text-[#122c35] shadow-sm [color-scheme:light] sm:p-7">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[#e1f8f0] text-[#129b80]"><span className="text-lg font-semibold">2</span></div><h2 className="font-display text-3xl tracking-wide">Two-factor authentication</h2><p className="mt-2 text-sm leading-6 text-[#557078]">Protect your account with an authenticator app and backup codes.</p></div><span className="rounded-full bg-[#eaf7f2] px-3 py-1.5 text-xs font-semibold text-[#128a72]">{enabled ? 'Enabled' : 'Not configured'}</span></div>
    {!setup ? <div className="mt-5 flex flex-col gap-3 sm:flex-row"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Confirm your password" aria-label="Password for 2FA" className="h-11 flex-1 rounded-xl border border-[#cfe0db] bg-[#f8fbfa] px-4 text-[#123844] outline-none placeholder:text-[#91a5a8] focus:ring-2 focus:ring-[#16b995]" /><button type="button" onClick={enable} disabled={loading || !password} className="h-11 rounded-xl bg-[#123844] px-5 font-semibold text-white disabled:opacity-50">{loading ? 'Starting…' : 'Set up 2FA'}</button></div> : <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[#dce9e5] bg-[#f8fbfa] p-4 sm:p-5"><p className="text-sm font-medium">Scan this QR code in your authenticator app</p><div className="flex justify-center rounded-2xl border border-[#d6e6e1] bg-white p-5 shadow-sm"><QRCodeSVG value={setup.totpURI} size={208} level="M" includeMargin aria-label="Two-factor authentication setup QR code" /></div><details className="rounded-lg border border-[#d6e6e1] bg-white"><summary className="cursor-pointer px-3 py-2 text-sm font-medium">Show setup URI instead</summary><code className="block break-all border-t border-[#d6e6e1] px-3 py-3 text-xs leading-5">{setup.totpURI}</code></details><div><p className="text-sm font-medium">Save your backup codes</p><p className="mt-1 text-xs text-[#557078]">These are shown once. Store them somewhere safe.</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{setup.backupCodes.map((code) => <code key={code} className="rounded-lg border border-[#d6e6e1] bg-white px-2 py-2 text-center text-xs">{code}</code>)}</div></div><div className="flex flex-col gap-2 rounded-lg border border-[#d6e6e1] bg-white p-4"><label htmlFor="totp-setup-code" className="text-sm font-medium">Enter the 6-digit code to finish setup</label><input id="totp-setup-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" aria-describedby="totp-setup-help" className="h-11 rounded-xl border border-[#d6e6e1] bg-white px-4 text-center font-mono text-lg tracking-[0.35em] outline-none focus:ring-2 focus:ring-[#16b995]" /><p id="totp-setup-help" className="text-xs text-[#557078]">Scan the code, wait for the current code, then confirm it here.</p><button type="button" onClick={confirmSetup} disabled={loading || verificationCode.length !== 6} className="h-11 rounded-xl bg-[#123844] px-5 font-semibold text-white disabled:opacity-50">{loading ? 'Verifying…' : 'Confirm and enable 2FA'}</button></div><button type="button" onClick={cancelSetup} disabled={loading} className="self-start text-sm font-medium text-[#b42318] underline underline-offset-4">Cancel setup</button></div>}
    {error && <p role="alert" className="mt-3 text-sm text-[#b42318]">{error}</p>}
  </article>
}

export default TwoFactorSettings
