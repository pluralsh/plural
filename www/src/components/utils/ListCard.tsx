import { Card } from '@pluralsh/design-system'
import { Div, Flex } from 'honorable'

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
          height={44}
          paddingHorizontal={16}
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

