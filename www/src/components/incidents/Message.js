import React, { useState } from 'react'
import { Box, Stack, Text } from "grommet"
import Avatar from '../users/Avatar'
import Markdown from './Markdown'
import moment from 'moment'
import { dateFormat } from '../../utils/date'
import { MessageControls } from './MessageControls'
import './message.css'

function isConsecutive(message, next) {
  if (!next || !next.creator) return false
  if (message.creator.id !== next.creator.id) return false
  const firstTime = moment(message.insertedAt)
  const secondTime = moment(next.insertedAt)

  return (secondTime.add(-10, 'minutes').isBefore(firstTime))
}


function MessageBody({message, next}) {
  const consecutive = isConsecutive(message, next)
  const formatted = dateFormat(moment(message.insertedAt))

  return (
    <Box flex={false} direction='row' gap='xsmall' pad={{vertical: 'xsmall', left: 'small'}}>
      <Box flex={false}>
        {!consecutive && <Avatar user={message.creator} size='45px' />}
        {consecutive && (
          <Box fill='vertical' width='45px' justify='center' align='center' flex={false}>
            <Text color='dark-2' size='10px' className='message-reactions'>{formatted}</Text>
          </Box>
        )}
      </Box>
      <Box fill='horizontal'>
        {!consecutive && <Box gap='xsmall' direction='row'>
          <Text size='small' weight='bold'>{message.creator.name}</Text>
          <Text size='small' color='dark-5'>{formatted}</Text>
        </Box>}
        <Box>
          <Markdown text={message.text} entities={message.entities} />
        </Box>
      </Box>
    </Box>
  )
}

 
export function Message({message, next}) {
  const [hover, setHover] = useState(false)
  const additionalClasses = hover ? ' hovered' : ''

  return (
    <Box flex={false} fill='horizontal' className={'message' + additionalClasses}>
      <Stack fill anchor='top-right'>
        <MessageBody message={message} next={next} />
        <MessageControls message={message} setHover={setHover} />
      </Stack>
    </Box>
  )
}