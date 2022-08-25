import { Box } from 'grommet'
import { Text } from 'honorable'

export function EmptyState({
  message, description, icon = undefined, children,
}) {
  return (
    <Box
      pad="64px"
      gap="16px"
      align="center"
    >
      {icon && (<Box margin={{ bottom: '20px' }}>{icon}</Box>)}
      <Text
        subtitle1
        textAlign="center"
      >
        {message}
      </Text>
      {description && (
        <Text
          body1
          color="text-light"
          textAlign="center"
        >{description}
        </Text>
      )}
      <Box>{children}</Box>
    </Box>
  )
}
