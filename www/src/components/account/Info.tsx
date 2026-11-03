import { Flex } from '@pluralsh/design-system'

import { SpanSC } from '../utils/Typography'

export function Info({ text, description, ...box }: any) {
  return (
    <Flex
      direction="column"
      width="100%"
      {...box}
    >
      <span css={{ fontWeight: 'bold' }}>{text}</span>
      <SpanSC $color="text-light">{description}</SpanSC>
    </Flex>
  )
}
