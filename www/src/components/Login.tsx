import { Box, Text } from 'grommet'
import { CheckIcon, ErrorIcon } from '@pluralsh/design-system'

export type PasswordError = 'TOO_SHORT' | 'NO_MATCH'

export const PasswordErrorMessage = {
  TOO_SHORT: 'Password is too short',
  NO_MATCH: 'Passwords do not match',
} as const satisfies Record<PasswordError, string>

export function disableState(password, confirm):{disabled:boolean, reason: string, error?: PasswordError} {
  if (password.length === 0) return { disabled: true, reason: '' }
  if (password.length < 10) return { disabled: true, reason: 'Password is too short', error: 'TOO_SHORT' }
  if (!confirm) return { disabled: true, reason: '' }
  if (confirm && password !== confirm) return { disabled: true, reason: 'Passwords do not match', error: 'NO_MATCH' }

  return { disabled: false, reason: '' }
}

export function PasswordStatus({ disabled, reason }: any) {
  return (
    <Box
      direction="row"
      fill="horizontal"
      align="center"
      gap="xsmall"
    >
      {reason ? disabled ? (
        <ErrorIcon
          color="error"
          size={12}
        />
      ) : (
        <CheckIcon
          color="good"
          size={12}
        />
      ) : null}
      <Text
        size="small"
        color={disabled ? 'error' : 'good'}
      >
        {reason}
      </Text>
    </Box>
  )
}
