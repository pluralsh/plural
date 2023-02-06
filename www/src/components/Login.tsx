export type PasswordErrorCode = 'TooShort' | 'NoMatch'

export const PasswordError = {
  TooShort: 'TooShort',
  NoMatch: 'NoMatch',
} as const satisfies Record<PasswordErrorCode, PasswordErrorCode>

export const PasswordErrorMessage = {
  TooShort: 'Password is too short',
  NoMatch: 'Passwords do not match',
} as const satisfies Record<PasswordErrorCode, string>

export function validatePassword(password,
  confirm): { disabled: boolean; error?: PasswordErrorCode } {
  if (password.length === 0) return { disabled: true }
  if (password.length < 10) return { disabled: true, error: PasswordError.TooShort }
  if (!confirm) return { disabled: true }
  if (confirm && password !== confirm) {
    return { disabled: true, error: PasswordError.NoMatch }
  }

  return { disabled: false }
}
