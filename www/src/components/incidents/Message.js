import { memo, useContext, useEffect, useState } from 'react'
import { Box, Stack, Text } from 'grommet'
import moment from 'moment'

import Avatar from '../users/Avatar'

import Markdown from './Markdown'
import { MessageControls } from './MessageControls'
import './message.css'
import MessageReactions from './MessageReactions'
import File from './File'
import { DateDivider } from './MessageDivider'
import { PresenceContext, PresenceIndicator } from './Presence'

const DATE_PATTERN = 'h:mm a'
const dateFormat = date => moment(date).format(DATE_PATTERN)

function isConsecutive(message, next) {
  if (!next || !next.creator) return false
  if (message.creator.id !== next.creator.id) return false
  const firstTime = moment(message.insertedAt)
  const secondTime = moment(next.insertedAt)

  return (firstTime.add(-10, 'minutes').isBefore(secondTime))
}

function MessageBody({ message, next, setHover, setSize }) {
  const [painted, setPainted] = useState(false)
  const { present } = useContext(PresenceContext)
  const consecutive = isConsecutive(message, next)
  const formatted = dateFormat(moment(message.insertedAt))

  useEffect(() => {
    if (consecutive !== painted) {
      setSize()
    }
    setPainted(consecutive)
  }, [painted, setPainted, consecutive, setSize])

  return (
    <Box
      flex={false}
      direction="row"
      gap="xsmall"
      pad={{ vertical: 'xsmall', left: 'small' }}
    >
      <Box flex={false}>
        {!consecutive && (
          <Avatar
            user={message.creator}
            size="45px"
          />
        )}
        {consecutive && (
          <Box
            fill="vertical"
            width="45px"
            justify="center"
            align="center"
            flex={false}
          >
            <Text
              color="dark-2"
              size="10px"
              className="message-reactions"
            >{formatted}
            </Text>
          </Box>
        )}
      </Box>
      <Box fill="horizontal">
        {!consecutive && (
          <Box
            gap="xsmall"
            direction="row"
            align="center"
          >
            <Text
              size="small"
              weight="bold"
            >{message.creator.name}
            </Text>
            {present[message.creator.id] && <PresenceIndicator />}
            <Text
              size="12px"
              color="dark-5"
            >{formatted}
            </Text>
          </Box>
        )}
        <Box flex={false}>
          <Markdown
            text={message.text}
            entities={message.entities || []}
          />
          {message.file && <File file={message.file} />}
          {message.reactions && message.reactions.length > 0 && (
            <MessageReactions
              message={message}
              setHover={setHover}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export const Message = memo(({ message, next, setSize }) => {
  const [hover, setHover] = useState(false)
  const additionalClasses = hover ? ' hovered' : ''

  return (
    <Box flex={false}>
      <DateDivider
        message={message}
        next={next}
        setSize={setSize}
      />
      <Box
        flex={false}
        fill="horizontal"
        className={`message${additionalClasses}`}
      >
        <Stack
          fill
          anchor="top-right"
        >
          <MessageBody
            message={message}
            next={next}
            hover={hover}
            setHover={setHover}
            setSize={setSize}
          />
          <MessageControls
            message={message}
            setHover={setHover}
          />
        </Stack>
      </Box>
    </Box>
  )
})
