import { Box } from 'grommet'
import { Span } from 'honorable'

import moment from 'moment'

export function Date({ date }) {
  if (!date) return (<Span>n/a</Span>)
  
  return (
    <Box>
      <Span>{moment(date).format('ll')}</Span>
      <Span color="text-xlight">{moment(date).format('h:mm A')}</Span>
    </Box>
  )
}
