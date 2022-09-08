import { Box, Text } from 'grommet'
import { CheckIcon, ErrorIcon } from 'pluralsh-design-system'

export function disableState(password, confirm) {
  if (password.length === 0) return { disabled: true, reason: '' }
  if (password.length < 10) return { disabled: true, reason: 'Password is too short' }
  if (!confirm) return { disabled: true, reason: '' }
  if (confirm && password !== confirm) return { disabled: true, reason: 'Passwords do not match' }

  return { disabled: false, reason: '' }
}

export function PasswordStatus({ disabled, reason }) {
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
