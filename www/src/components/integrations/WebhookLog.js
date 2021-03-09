import React, { useState } from 'react'
import { Box, Text, Collapsible } from 'grommet'
import { StateToColor } from './types'
import { dateFormat } from '../../utils/date'

function WebhookLogStatus({state}) {
  return (
    <Box flex={false} pad={{horizontal: 'small', vertical: 'xsmall'}} background={StateToColor[state]}>
      <Text size='small'>{state.toLowerCase()}</Text>
    </Box>
  )
}

function WebhookResponse({response}) {
  return (
    <Box round='small' background='light-3' pad='small'>
      <pre>{response}</pre>
    </Box>
  )
}

export function WebhookLog({log}) {
  const [open, setOpen] = useState(false)
  return (
    <Box pad='small' onClick={() => setOpen(!open)} hoverIndicator='light-3' direction='row' align='center'>
      <Box fill='horizontal'>
        <Box fill='horizontal' direction='row' align='center' gap='xsmall'>
          <Text size='small'>Response {log.status}</Text>
          <Text size='small' color='dark-3'>{dateFormat(log.insertedAt)}</Text>
        </Box>
        <Collapsible open={open}>
          <Box pad='small'>
            <WebhookResponse response={log.response} />
          </Box>
        </Collapsible>
      </Box>
      <WebhookLogStatus state={log.state} />
    </Box>
  )
}