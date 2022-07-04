import { useCallback, useContext, useRef, useState } from 'react'
import { Box, Drop, Text } from 'grommet'
import { Edit, Emoji, TooltipContent, Trash } from 'forge-core'
import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { CurrentUserContext } from '../login/CurrentUser'

import { updateCache } from '../../utils/graphql'

import { EmojiPicker } from './Emoji'
import { CREATE_REACTION, DELETE_MESSAGE, INCIDENT_Q } from './queries'

const SIZE = '35px'
const CONTROL_ATTRS = {
  fill: true,
  focusIndicator: false,
  pad: 'xsmall',
  hoverIndicator: 'light-2',
  align: 'center',
  justify: 'center',
}
const PAD = '2px'
const OUTER = { height: SIZE, width: SIZE, align: 'center', justify: 'center' }

export function Control({ children, tooltip, pad, closed, ...rest }) {
  const ref = useRef()
  const [hover, setHover] = useState(false)

  return (
    <>
      <Box
        ref={ref}
        pad={pad || PAD}
        {...OUTER}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        {...rest}
      >
        {children}
      </Box>
      {hover && !closed && (
        <TooltipContent
          targetRef={ref}
          align={{ bottom: 'top' }}
        >
          <Text size="xsmall">{tooltip}</Text>
        </TooltipContent>
      )}
    </>
  )
}

export function Reaction({ message, setHover, align, width, label, ...props }) {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  const toggleOpen = useCallback(value => {
    if (setHover) setHover(value)
    setOpen(value)
  }, [setOpen, setHover])
  const [mutation] = useMutation(CREATE_REACTION, { variables: { id: message.id } })

  return (
    <>
      <Control
        tooltip="add reaction"
        width={width}
      >
        <Box
          ref={ref}
          onClick={() => toggleOpen(!open)}
          {...CONTROL_ATTRS}
          {...props}
        >
          <Emoji size="small" />
          {label && (<Text size="xsmall">{label}</Text>)}
        </Box>
      </Control>
      {open && (
        <Drop
          target={ref.current}
          align={align || { right: 'left' }}
          onClickOutside={() => toggleOpen(false)}
          onEsc={() => toggleOpen(false)}
        >
          <EmojiPicker onSelect={emoji => {
            mutation({ variables: { name: emoji.id } })
          }}
          />
        </Drop>
      )}
    </>
  )
}

function EditMsg() {
  return (
    <Control tooltip="edit">
      <Box
        {...CONTROL_ATTRS}
        onClick={() => null}
      >
        <Edit size="small" />
      </Box>
    </Control>
  )
}

function Delete({ message }) {
  const { incidentId } = useParams()
  const [mutation] = useMutation(DELETE_MESSAGE, {
    variables: { id: message.id },
    update: cache => updateCache(cache, {
      query: INCIDENT_Q,
      variables: { id: incidentId },
      update: ({ incident: { messages, ...incident }, ...prev }) => (
        { ...prev,
          incident: { ...incident,
            messages: {
              ...messages, edges: messages.edges.filter(({ node }) => node.id !== message.id),
            } } }
      ),
    }),
  })

  return (
    <Control tooltip="delete">
      <Box
        {...CONTROL_ATTRS}
        onClick={mutation}
      >
        <Trash size="small" />
      </Box>
    </Control>
  )
}

export function MessageControls({ message, setHover }) {
  const me = useContext(CurrentUserContext)

  return (
    <Box
      className="message-controls"
      border={{ color: 'border' }}
      elevation="xsmall"
      background="white"
      direction="row"
      align="center"
      height={SIZE}
      round="xsmall"
      margin={{ right: '10px', top: '-10px' }}
    >
      <Reaction
        message={message}
        setHover={setHover}
      />
      {me.id === message.creator.id && <EditMsg message={message} />}
      {me.id === message.creator.id && <Delete message={message} />}
    </Box>
  )
}
