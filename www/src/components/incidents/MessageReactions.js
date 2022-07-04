/* eslint-disable camelcase */
import { useContext } from 'react'
import { useMutation } from '@apollo/client'
import { Box, Text } from 'grommet'
import { Tooltip } from 'forge-core'
import 'emoji-mart/css/emoji-mart.css'
import { Emoji } from 'emoji-mart'

import { groupBy } from '../../utils/array'

import { CurrentUserContext } from '../login/CurrentUser'

import { CREATE_REACTION, DELETE_REACTION } from './queries'
import { Reaction as MessageReaction } from './MessageControls'

const BOX_ATTRS = {
  pad: { horizontal: 'xsmall', vertical: '3px' },
  direction: 'row',
  focusIndicator: false,
  height: '28px',
  round: 'xsmall',
  align: 'center',
  justify: 'center',
}

function Reaction({ name, reactions, me, messageId }) {
  const prolog = reactions.slice(0, 3).map(({ creator: { email } }) => email)
  const text = prolog.length > 2 ? `${prolog.join(', ')} and ${reactions.length - prolog.length} more` :
    prolog.length === 2 ? `${prolog[0]} and ${prolog[1]}` : prolog[0]
  const mutationQuery = reactions.find(r => r.creator.id === me.id) ?
    DELETE_REACTION : CREATE_REACTION
  const [mutation] = useMutation(mutationQuery, { variables: { id: messageId } })

  return (
    <Tooltip>
      <Box
        {...BOX_ATTRS}
        background="highlight"
        gap="xsmall"
        onClick={() => mutation({ variables: { name } })}
      >
        <Text size="10px">
          <Emoji
            set="google"
            emoji={name}
            size={18}
            style={{ lineHeight: 0 }}
          />
        </Text>
        <Text
          size="10px"
          margin={{ left: '3px' }}
          color="brand"
        >{reactions.length}
        </Text>
      </Box>
      <Text size="xsmall">{text} reacted with :{name}:</Text>
    </Tooltip>
  )
}

export default function MessageReactions({ message, setHover }) {
  const me = useContext(CurrentUserContext)
  const grouped = groupBy(message.reactions, reaction => reaction.name)
  const sorted = Object.entries(grouped).sort(([name, reactions], [other_name, other_reactions]) => {
    const byLength = other_reactions.length - reactions.length

    if (byLength === 0) return other_name.localeCompare(name)

    return byLength
  })

  return (
    <Box
      direction="row"
      margin={{ top: 'xsmall' }}
      align="center"
    >
      <Box
        direction="row"
        gap="xsmall"
        height="25px"
        margin={{ right: 'xsmall' }}
        align="center"
      >
        {sorted.map(([name, reactions]) => (
          <Reaction
            key={name}
            me={me}
            name={name}
            reactions={reactions}
            messageId={message.id}
          />
        ))}
      </Box>
      <Box
        flex={false}
        direction="row"
        height="25px"
        className="message-reactions"
        align="center"
      >
        <MessageReaction
          message={message}
          setHover={setHover}
          align={{ bottom: 'top' }}
          label="+"
          direction="row"
          gap="2px"
          background="white"
          border={{ color: 'border' }}
          round="xsmall"
          {...BOX_ATTRS}
        />
      </Box>
    </Box>
  )
}
