import { Box } from 'grommet'
import { Span } from 'honorable'

import { formatLocation } from '../../utils/geo'

export function Location({ ip, city, country }) {
  if (!ip) return (<Span>n/a</Span>)
  
  return (
    <Box>
      {country && (<Span fontWeight="bold">{formatLocation(country, city)}</Span>)}
      <Span color="text-xlight">{ip}</Span>
    </Box>
  )
}
