export function normalizeHttpUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let url: URL
  try {
    url = new URL(withScheme)
  } catch {
    throw new Error('Länken är inte giltig.')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Länken måste använda http eller https.')
  }
  if (!url.hostname.includes('.')) {
    throw new Error('Länken behöver ett giltigt värdnamn.')
  }
  return url.toString()
}

export function safeHttpUrl(value: string): string | null {
  try {
    const normalized = normalizeHttpUrl(value)
    return normalized || null
  } catch {
    return null
  }
}
