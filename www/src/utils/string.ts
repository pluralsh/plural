export const obfuscate = (str) =>
  `${str.substring(0, 5)}${'*'.repeat(str.length - 5)}`

/**
 * Returns true when `url` is NOT a valid URL (call sites use this as a form error flag).
 * Uses the URL constructor instead of a backtracking regex to avoid ReDoS.
 */
export function isValidUrl(url: string): boolean {
  if (!url) return true

  try {
    const candidate = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`
    const parsed = new URL(candidate)

    // Match previous regex intent: HTTP(S) only and a dotted hostname.
    if (
      !['http:', 'https:'].includes(parsed.protocol) ||
      !parsed.hostname.includes('.')
    ) {
      return true
    }

    return false
  } catch {
    return true
  }
}

export function generateString(len: number): string {
  const dictionary = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const dictionaryLen = dictionary.length

  return new Array(len)
    .join()
    .split(',')
    .map((_) => dictionary[Math.floor(Math.random() * dictionaryLen)])
    .join('')
}

export const pluralize = (str: string, val: number) =>
  `${str}${val > 1 || val === 0 ? 's' : ''}`
