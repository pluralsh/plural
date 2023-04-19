import { Card } from '@pluralsh/design-system'
import { Flex } from 'honorable'

type ListCardProps = {
  header?: any
  input?: any
  children: any
}

export default function ListCard({ header, input, children }: ListCardProps) {
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
          paddingHorizontal={12}
        >
          {header}
        </Flex>
      )}
      {input && (
        <Flex
          backgroundColor="fill-one"
          borderBottom="1px solid border-fill-two"
        >
          {input}
        </Flex>
      )}
      <Flex
        backgroundColor="fill-one"
        borderBottomLeftRadius={6}
        borderBottomRightRadius={6}
        grow={1}
        direction="column"
        minHeight={56}
      >
        {children}
      </Flex>
    </Card>
  )
}

