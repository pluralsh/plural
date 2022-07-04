import { Box, Text } from 'grommet'
import { Checkmark, StatusCritical } from 'grommet-icons'

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
        <StatusCritical
          color="error"
          size="12px"
        />
      ) : (
        <Checkmark
          color="good"
          size="12px"
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
