export function BrandLogo({ size = 38, className = '' }: { size?: number; className?: string }) {
  return <span aria-hidden="true" style={{ width: size, height: size }} className={`grid shrink-0 place-items-center rounded-xl bg-[#087f68] text-sm font-bold leading-none text-white shadow-sm ${className}`}>B</span>
}
