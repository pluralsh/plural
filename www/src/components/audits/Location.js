import { Box } from 'grommet'
import { Span } from 'honorable'

import { formatLocation } from '../../utils/geo'

export function Location({ ip, city, country }) {
  if (!ip) return (<Span color="text-light">n/a</Span>)
  
  return (
    <Box>
      {country && (
        <Span
          fontWeight="bold"
          color="white"
        >{formatLocation(country, city)}
        </Span>
      )}
      <Span color="text-light">{ip}</Span>
    </Box>
  )
}
