'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function TwoFactorPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [useBackup, setUseBackup] = useState(false)
  const [trustDevice, setTrustDevice] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if ((event.nativeEvent as KeyboardEvent).isComposing || (event as unknown as KeyboardEvent).keyCode === 229) return
    setLoading(true)
    setError('')
    const result = useBackup
      ? await authClient.twoFactor.verifyBackupCode({ code })
      : await authClient.twoFactor.verifyTotp({ code, trustDevice })
    if (result.error) {
      setError('That code is invalid or expired. Try again.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9f8] px-6 py-12 text-[#122c35] [color-scheme:light]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#d6e6e1] bg-white p-8 shadow-2xl shadow-[#164b4a]/10">
        <p className="font-display text-2xl tracking-wide">ChargeUp</p>
        <h1 className="mt-8 font-display text-4xl leading-none tracking-wide">Verify your identity</h1>
        <p className="mt-3 text-sm leading-6 text-[#557078]">Enter the six-digit code from your authenticator app to continue.</p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <label className="flex flex-col gap-2 text-sm font-medium">
            {useBackup ? 'Backup code' : 'Authentication code'}
            <input autoFocus required inputMode="numeric" autoComplete="one-time-code" pattern={useBackup ? undefined : '[0-9]{6}'} maxLength={useBackup ? 32 : 6} value={code} onChange={(event) => setCode(event.target.value)} className="h-12 rounded-xl border border-[#cfe0db] bg-[#f8fbfa] px-4 font-mono tracking-[0.25em] text-[#123844] outline-none placeholder:text-[#91a5a8] focus:ring-2 focus:ring-[#16b995]" placeholder={useBackup ? 'Enter backup code' : '000000'} />
          </label>
          {!useBackup && <label className="flex items-center gap-3 text-sm text-[#557078]"><input type="checkbox" checked={trustDevice} onChange={(event) => setTrustDevice(event.target.checked)} className="size-4 accent-primary" /> Trust this device for 30 days</label>}
          {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <button disabled={loading} className="h-12 rounded-xl bg-[#123844] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50">{loading ? 'Verifying…' : 'Verify and continue'}</button>
        </form>
        <button type="button" onClick={() => { setUseBackup(!useBackup); setCode(''); setError('') }} className="mt-6 text-sm font-medium text-[#557078] underline underline-offset-4 hover:text-foreground">{useBackup ? 'Use authenticator code' : 'Use a backup code instead'}</button>
      </section>
    </main>
  )
}
