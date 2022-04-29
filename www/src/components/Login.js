import { Box, Text } from 'grommet'
import { Checkmark, StatusCritical } from 'grommet-icons'

export function disableState(password, confirm) {
  if (password.length === 0) return { disabled: true, reason: 'enter a password' }
  if (password.length < 10) return { disabled: true, reason: 'password is too short' }
  if (password !== confirm) return { disabled: true, reason: 'passwords do not match' }

  return { disabled: false, reason: 'passwords match!' }
}

export function PasswordStatus({ disabled, reason }) {
  return (
    <Box
      direction="row"
      fill="horizontal"
      align="center"
      gap="xsmall"
    >
      {disabled ? (
        <StatusCritical
          color="error"
          size="12px"
        />
      ) : (
        <Checkmark
          color="good"
          size="12px"
        />
      )}
      <Text
        size="small"
        color={disabled ? 'error' : 'good'}
      >{reason}
      </Text>
    </Box>
  )
}
