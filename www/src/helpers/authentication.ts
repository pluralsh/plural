import { LocalStorageKeys } from '../constants'

const ENC_PREFIX = 'enc.v1.'

/** In-memory cache so fetchToken/setToken stay synchronous for Apollo. */
let cachedToken: string | null = null

/**
 * Monotonic generation so async encrypt writes cannot clobber a newer
 * setToken()/wipeToken() (or an older write finishing last).
 */
let tokenGeneration = 0

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

let encryptionKeyPromise: Promise<CryptoKey> | null = null

function getEncryptionKey(): Promise<CryptoKey> {
  if (!encryptionKeyPromise) {
    encryptionKeyPromise = (async () => {
      const material = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(`plural-www:${window.location.origin}`),
        'PBKDF2',
        false,
        ['deriveKey']
      )

      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: new TextEncoder().encode('plural-auth-token-v1'),
          iterations: 100_000,
          hash: 'SHA-256',
        },
        material,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      )
    })()
  }

  return encryptionKeyPromise
}

async function encryptToken(token: string): Promise<string> {
  const key = await getEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(token)
  )
  const packed = new Uint8Array(iv.length + ciphertext.byteLength)
  packed.set(iv, 0)
  packed.set(new Uint8Array(ciphertext), iv.length)
  return `${ENC_PREFIX}${bytesToBase64(packed)}`
}

async function decryptToken(payload: string): Promise<string> {
  const packed = base64ToBytes(payload.slice(ENC_PREFIX.length))
  const iv = packed.slice(0, 12)
  const ciphertext = packed.slice(12)
  const key = await getEncryptionKey()
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )
  return new TextDecoder().decode(plaintext)
}

async function persistEncrypted(
  token: string,
  generation: number
): Promise<void> {
  const encrypted = await encryptToken(token)
  // Drop stale writes that lost a race with wipeToken()/setToken().
  if (generation !== tokenGeneration) return
  localStorage.setItem(LocalStorageKeys.AuthToken, encrypted)
}

function queuePersist(token: string, generation: number): void {
  void persistEncrypted(token, generation).catch(() => {
    // Crypto/storage may be unavailable; keep the in-memory token for this session.
  })
}

/**
 * Load any persisted auth token into memory before the app renders.
 * Migrates legacy plaintext tokens to encrypted storage.
 * Never throws — storage failures leave the app logged out.
 */
export async function hydrateAuthToken(): Promise<void> {
  let raw: string | null
  try {
    raw = localStorage.getItem(LocalStorageKeys.AuthToken)
  } catch {
    cachedToken = null
    return
  }

  if (!raw) {
    cachedToken = null
    return
  }

  if (!raw.startsWith(ENC_PREFIX)) {
    cachedToken = raw
    const generation = ++tokenGeneration
    try {
      await persistEncrypted(raw, generation)
    } catch {
      // Keep the legacy plaintext token readable if encryption fails.
    }
    return
  }

  try {
    cachedToken = await decryptToken(raw)
    tokenGeneration += 1
  } catch {
    cachedToken = null
    try {
      localStorage.removeItem(LocalStorageKeys.AuthToken)
    } catch {
      // Ignore storage removal failures.
    }
  }
}

export function wipeToken() {
  tokenGeneration += 1
  cachedToken = null
  try {
    localStorage.removeItem(LocalStorageKeys.AuthToken)
  } catch {
    // Ignore storage removal failures.
  }
}

export function fetchToken() {
  return cachedToken
}

export function setToken(token) {
  if (!token) {
    wipeToken()
    return
  }

  const generation = ++tokenGeneration
  cachedToken = token
  queuePersist(token, generation)
}

export function setPreviousUserData(userData) {
  localStorage.setItem(
    LocalStorageKeys.AuthPreviousUserData,
    JSON.stringify(userData)
  )
}

export function getPreviousUserData() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(LocalStorageKeys.AuthPreviousUserData) as string
      ) || null
    )
  } catch (_error) {
    return null
  }
}
