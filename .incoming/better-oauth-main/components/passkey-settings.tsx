'use client'

import { useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'

type Passkey = {
  id: string
  name?: string | null
  aaguid?: string | null
  createdAt?: string | Date | null
}

export function PasskeySettings() {
  const { data: session } = authClient.useSession()
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [name, setName] = useState('This device')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEmbedded, setIsEmbedded] = useState(false)

  useEffect(() => {
    setIsEmbedded(window.self !== window.top)
  }, [])

  async function loadPasskeys() {
    const result = await authClient.passkey.listUserPasskeys()
    if (result.data) setPasskeys(result.data as Passkey[])
    if (result.error) setError('Unable to load your passkeys.')
  }

  useEffect(() => {
    if (session?.user) void loadPasskeys()
  }, [session?.user])

  async function addPasskey() {
    if (isEmbedded) {
      window.open('/settings/security?passkey=1', '_blank', 'noopener,noreferrer')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')
    const result = await authClient.passkey.addPasskey({ name: name.trim() || 'Passkey' })
    if (result.error) setError(result.error.message || 'Unable to register this passkey.')
    else {
      setMessage('Passkey registered successfully.')
      setName('This device')
      await loadPasskeys()
    }
    setLoading(false)
  }

  async function renamePasskey(passkey: Passkey) {
    const nextName = window.prompt('Name this passkey', passkey.name || 'Passkey')?.trim()
    if (!nextName || nextName === passkey.name) return
    const result = await authClient.passkey.updatePasskey({ id: passkey.id, name: nextName })
    if (result.error) setError('Unable to rename this passkey.')
    else await loadPasskeys()
  }

  async function removePasskey(id: string) {
    if (!window.confirm('Remove this passkey from your account?')) return
    const result = await authClient.passkey.deletePasskey({ id })
    if (result.error) setError('Unable to remove this passkey.')
    else {
      setMessage('Passkey removed.')
      await loadPasskeys()
    }
  }

  return (
    <section className="rounded-2xl border border-[#d6e6e1] bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Passkeys</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Use your device biometrics, PIN, or security key to sign in without a password.</p>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input value={name} onChange={(event) => setName(event.target.value)} aria-label="Passkey name" className="h-11 flex-1 rounded-xl border border-[#cfe0db] bg-[#f8fbfa] px-4 text-[#123844] outline-none placeholder:text-[#91a5a8] focus:ring-2 focus:ring-[#16b995]" placeholder="Passkey name" />
        <button type="button" onClick={addPasskey} disabled={loading || !session?.user} className="h-11 rounded-xl bg-[#123844] px-5 font-semibold text-white disabled:opacity-50">{loading ? 'Waiting for authenticator…' : isEmbedded ? 'Open secure setup' : 'Add passkey'}</button>
      </div>
      {isEmbedded && <p className="mt-3 text-sm leading-6 text-muted-foreground">Passkeys require a top-level page in this preview. Select “Open secure setup” and complete registration in the new tab.</p>}
      {passkeys.length > 0 && <ul className="mt-5 flex flex-col gap-2">{passkeys.map((passkey) => <li key={passkey.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"><div><p className="text-sm font-medium">{passkey.name || 'Passkey'}</p><p className="text-xs text-muted-foreground">Registered {passkey.createdAt ? new Date(passkey.createdAt).toISOString().slice(0, 10) : 'recently'}</p></div><div className="flex gap-3 text-sm"><button type="button" onClick={() => renamePasskey(passkey)} className="font-medium text-muted-foreground hover:text-foreground">Rename</button><button type="button" onClick={() => removePasskey(passkey.id)} className="font-medium text-destructive">Remove</button></div></li>)}</ul>}
      {passkeys.length === 0 && <p className="mt-5 text-sm text-muted-foreground">No passkeys registered yet.</p>}
      {message && <p role="status" className="mt-3 text-sm text-primary">{message}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  )
}

export default PasskeySettings
