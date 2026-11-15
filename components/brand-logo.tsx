const brandImageUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/appstore.png-YJlhRvbtnvx1QCKOM7Pze212HKULd8.jpeg'

export function BrandLogo({ size = 38, className = '' }: { size?: number; className?: string }) {
  return (
    <span aria-hidden="true" style={{ width: size, height: size }} className={`grid shrink-0 place-items-center overflow-hidden rounded-xl ${className}`}>
      <img src={brandImageUrl} alt="" className="size-full object-cover" />
    </span>
  )
}
