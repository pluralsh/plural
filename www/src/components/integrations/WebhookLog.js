import React, { useState } from 'react'
import { Box, Text, Collapsible } from 'grommet'
import { Tabs, TabHeader, TabHeaderItem, TabContent } from 'forge-core'
import { StateToColor } from './types'
import { dateFormat } from '../../utils/date'
import ReactJson from 'react-json-view'
import moment from 'moment'

function WebhookLogStatus({state}) {
  return (
    <Box flex={false} pad={{horizontal: 'small', vertical: 'xsmall'}} background={StateToColor[state]}>
      <Text size='small'>{state.toLowerCase()}</Text>
    </Box>
  )
}

function WebhookResponse({log: {response, payload}}) {
  return (
    <Box flex={false}>
      <Tabs defaultTab='response'>
        <TabHeader>
          <TabHeaderItem name='request'>
            <Text weight={500} size='small'>Request</Text>
          </TabHeaderItem>
          <TabHeaderItem name='response'>
            <Text weight={500} size='small'>Response</Text>
          </TabHeaderItem>
        </TabHeader>
        <TabContent name='response'>
          <Box round='small' background='light-3' pad='small' margin='small'>
            <pre>{response}</pre>
          </Box>
        </TabContent>
        <TabContent name='request'>
          <Box flex={false} pad='small'>
            <ReactJson src={payload} />
          </Box>
        </TabContent>
      </Tabs>
    </Box>
  )
}

export function WebhookLog({log}) {
  const [open, setOpen] = useState(false)

  return (
    <Box flex={false} fill='horizontal'>
      <Box flex={false} pad='small' fill='horizontal' direction='row' align='center' onClick={() => setOpen(!open)} hoverIndicator='light-3'
        border={{side: 'bottom', color: 'light-5'}}>
        <Box fill='horizontal' direction='row' align='center' gap='xsmall'>
          <Text size='small'>Response {log.status}</Text>
          <Text size='small' color='dark-3'>{dateFormat(moment(log.insertedAt))}</Text>
        </Box>
        <WebhookLogStatus state={log.state} />
      </Box>
      <Collapsible open={open}>
        <Box pad='small'>
          <WebhookResponse log={log} />
        </Box>
      </Collapsible>
    </Box>
  )
}