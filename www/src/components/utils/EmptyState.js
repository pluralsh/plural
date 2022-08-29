import { Div, Flex, Text } from 'honorable'

export function EmptyState({
  message,
  description,
  icon = null,
  children,
}) {
  return (
    <Flex
      padding="xxlarge"
      gap="medium"
      direction="column"
      align="center"
    >
      {icon && (<Div marginBottom="large">{icon}</Div>)}
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
        >
          {description}
        </Text>
      )}
      {children}
    </Flex>
  )
}
