import { Card } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'

export default function ListCard({ header, children }) {
  return (
    <Card
      borderRadius={6}
      display="flex"
      flexDirection="column"
      flexGrow={1}
      fillLevel={2}
    >
      {header && (
        <Flex
          align="center"
          backgroundColor="fill-two"
          body2
          fontWeight={600}
          borderBottom="1px solid border-fill-two"
          borderTopLeftRadius={6}
          borderTopRightRadius={6}
          minHeight={44}
          paddingHorizontal={16}
          paddingVertical={8}
        >
          {header}
        </Flex>
      )}
      <Div
        backgroundColor="fill-one"
        borderBottomLeftRadius={6}
        borderBottomRightRadius={6}
        flexGrow={1}
        direction="column"
        overflowY="auto"
      >
        {children}
      </Div>
    </Card>
  )
}

