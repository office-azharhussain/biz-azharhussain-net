import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Image from 'next/image'
import { AuthForm } from '@/components/auth-form'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-vGkcxkZYbisgjSX2hHJ10YM18jRpc8.png'

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/dashboard')
  return <main className="relative flex h-[100svh] min-h-[100svh] items-center justify-center overflow-hidden bg-[#f7f9f8] px-3 py-3 text-[#122c35] [color-scheme:light] sm:px-6 sm:py-6"><div className="absolute -left-24 -top-24 size-80 rounded-full bg-[#d9f5eb] blur-3xl" /><section className="relative max-h-full w-full max-w-md overflow-hidden rounded-[2rem] border border-[#d6e6e1] bg-white p-5 shadow-2xl shadow-[#164b4a]/10 sm:p-8"><div className="mb-4 sm:mb-6"><a href="/" className="mb-4 flex items-center gap-3 sm:mb-6"><Image src={logoUrl} alt="ChargeUp logo" width={38} height={38} unoptimized /><span className="font-display text-2xl tracking-wide">ChargeUp</span></a><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#16a386]">Welcome back</p><h1 className="mt-3 font-display text-5xl leading-none tracking-wide">Sign in to ChargeUp</h1><p className="mt-4 leading-7 text-[#557078]">Continue to your spend governance workspace.</p></div><AuthForm mode="sign-in" /></section></main>
}
