import { Box } from 'grommet'
import { Text } from 'honorable'

export function EmptyState({ message, description, children }) {
  return (
    <Box
      pad="64px"
      gap="24px"
      align="center"
    >
      <Text subtitle1>{message}</Text>
      {description && (
        <Text
          body1
          color="text-light"
        >{description}
        </Text>
      )}
      <Box>{children}</Box>
    </Box>
  )
}
