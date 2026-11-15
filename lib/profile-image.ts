const microsoftProviderIds = new Set(['chargeup-microsoft', 'microsoft'])

export function getProfileImageSource(userId: string, image: string | null | undefined, providerIds: string[]) {
  if (providerIds.some((providerId) => microsoftProviderIds.has(providerId))) {
    return `/api/profile-image?userId=${encodeURIComponent(userId)}`
  }

  if (!image) return null
  if (image.startsWith('/') && !image.startsWith('//')) return image

  try {
    const url = new URL(image)
    if (url.protocol !== 'https:' || url.hostname.toLowerCase() === 'graph.microsoft.com') return null
    return url.toString()
  } catch {
    return null
  }
}
