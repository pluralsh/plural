import React from 'react'
import { Box, Text } from "grommet"
import Avatar from '../users/Avatar'
import Markdown from './Markdown'
import moment from 'moment'
import { dateFormat } from '../../utils/date'

export function Message({message}) {
  return (
    <Box direction='row' gap='xsmall' margin={{bottom: 'small'}}>
      <Box pad={{vertical: 'small'}}>
        <Avatar round='full' user={message.creator} size='45px' />
      </Box>
      <Box fill='horizontal' border={{color: 'light-4'}} round='xsmall'>
        <Box round={{size: 'xsmall', corner: 'top'}} background='light-1' gap='xsmall' direction='row'
            pad={{horizontal: 'small', vertical: 'xsmall'}}  border={{side: 'bottom', color: 'light-3'}}>
          <Text size='small' weight='bold'>{message.creator.name}</Text>
          <Text size='small'>commented on {dateFormat(moment(message.insertedAt))}</Text>
        </Box>
        <Box pad='small'>
          <Markdown text={message.text} entities={message.entities} />
        </Box>
      </Box>
    </Box>
  )
}