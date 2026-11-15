import Image from 'next/image'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-FMPVM6zZ5Ow0sKnhATFsMzEuBDIWOL.png'

export function BrandLogo({ size = 38, className = '' }: { size?: number; className?: string }) {
  return <Image src={logoUrl} alt="ChargeUp AI Lab logo" width={size} height={size} unoptimized className={`object-contain ${className}`} />
}
