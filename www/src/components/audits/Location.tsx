import { Flex } from '@pluralsh/design-system'

import { formatLocation } from '../../utils/geo'
import { SpanSC } from '../utils/Typography'

export function Location({ ip, city, country }: any) {
  if (!ip) return <span>n/a</span>

  return (
    <Flex direction="column">
      {country && <span>{formatLocation(country, city)}</span>}
      <SpanSC $color="text-xlight">{ip}</SpanSC>
    </Flex>
  )
}
