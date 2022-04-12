import { Box, Text } from 'grommet'
import last from 'lodash.last'

export function initials(name) {
  const initials = name
          .split(' ')
          .map(n => n.charAt(0).toUpperCase())
  if (initials.length <= 1) return initials[0]

  return `${initials[0]}${last(initials)}`
}

export default function Avatar({ size, user, round, ...rest }) {
  return (
    <Box
      flex={false}
      round={round || '3px'}
      style={user.avatar ? { backgroundImage: `url(${user.avatar})`, backgroundPosition: 'center', backgroundSize: 'cover' } : null}
      align="center"
      justify="center"
      width={size}
      height={size}
      background={!user.avatar ? user.backgroundColor : null}
      {...rest}
    >
      {!user.avatar && <Text size="small">{initials(user.name)}</Text>}
    </Box>
  )
}
