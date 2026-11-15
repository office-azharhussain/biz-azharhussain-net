'use client'

import { useState } from 'react'

type ProfileAvatarProps = {
  imageUrl: string | null | undefined
  name: string
  className?: string
}

export function ProfileAvatar({ imageUrl, name, className = 'size-8' }: ProfileAvatarProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const imageSource = imageUrl && failedImageUrl !== imageUrl ? imageUrl : null
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U'

  return (
    <span aria-hidden="true" className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#123844] text-xs font-semibold text-white/85 ${className}`}>
      {imageSource ? (
        <>
          {/* The authenticated image endpoint needs the browser cookie, so bypass Next's server-side image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSource} alt="" className="absolute inset-0 size-full object-cover" onError={() => setFailedImageUrl(imageSource)} />
        </>
      ) : <span>{initials}</span>}
    </span>
  )
}
