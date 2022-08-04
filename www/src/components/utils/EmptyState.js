import { Box } from 'grommet'
import { Text } from 'honorable'

export function EmptyState({ message, children }) {
  return (
    <Box
      pad="64px"
      gap="24px"
      align="center"
    >
      <Text subtitle1>{message}</Text>
      <Box>{children}</Box>
    </Box>
  )
}
