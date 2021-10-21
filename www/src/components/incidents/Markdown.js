import React, { useContext, useRef, useState } from 'react'
import { Markdown, Box, Text, Anchor, ThemeContext, Drop } from "grommet"
import { WithCopy, TooltipContent, Copy } from 'forge-core'
import Highlight from 'react-highlight.js'
import hljs from 'highlight.js'
import { EntityType } from './types'
import { normalizeColor } from 'grommet/utils'
import { sortBy } from 'lodash'
import { Emoji as Emojii } from 'emoji-mart'
import Avatar from '../users/Avatar'

function Blockquote({children}) {
  return (
    <Box border={{side: 'left', size: '2px', color: 'light-6'}} pad={{horizontal: 'small'}}>
      {children}
    </Box>
  )
}

export function Code({children, className, multiline}) {
  const theme = useContext(ThemeContext)
  if (className && className.startsWith('lang-')) {
    const lang = className && className.slice(5)
    if (hljs.getLanguage(lang)) {
      return (
        <Box fill='horizontal' round='xxsmall' border={{color: 'light-5'}}>
          <Box fill='horizontal' border={{side: 'bottom', color: 'light-5'}} direction='row' justify='end'
            gap='xsmall' background='light-3' pad='xsmall' align='center'>
            <Text size='small' weight={500} color='dark-3'>language:</Text>
            <Text size='small' color='dark-3'>{lang}</Text>
            <WithCopy text={children} pillText={`copied ${lang} contents`}>
              <Copy style={{cursor: 'pointer'}} size='small' />
            </WithCopy>
          </Box>
          <Highlight language={lang}>{children}</Highlight>
        </Box>
      )
    }
  }

  return (
    <span>
      <Box flex={false} style={{display: 'inline-block', color: multiline ? null : normalizeColor('notif', theme)}}
          pad={multiline ? 'xsmall' : {horizontal: 'xxsmall'}} round='xxsmall'
          border={{color: 'light-6'}} background='light-2'>
        <pre>
          <code>{children}</code>
        </pre>
      </Box>
    </span>
  )
}

function Preformat({children}) {
  return (
    <Box flex={false} pad={{vertical: 'xsmall'}}>
      {React.cloneElement(children, {multiline: true})}
    </Box>
  )
}

function Mention({text, user}) {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  return (
    <>
    <Box 
      ref={ref} style={{display: 'inline-block'}} round='xsmall' background='light-3' focusIndicator={false}
      pad={{horizontal: 'xxsmall'}} onClick={() => setOpen(!open)} hoverIndicator='light-5'>
      <Text size='small' weight={500}>@{text}</Text>
    </Box>
    {open && (
      <Drop target={ref.current} align={{bottom: 'top'}} onClickOutside={() => setOpen(false)}>
        <Box direction='row' gap='xsmall' align='center' pad={{horizontal: 'small', vertical: 'xsmall'}}>
          <Avatar user={user} size='30px' />
          <Text size='small' weight={500}>{user.name}</Text>
          <Text size='small' color='dark-5'>-- {user.email}</Text>
        </Box>
      </Drop>
    )}
    </>
  )
}

const RIGHT_MARGIN = '3px'

function Emoji({name}) {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  return (
    <>
    <span style={{
      display: 'inline-block', alignItems: 'center', height: '16px', width: '16px',
      lineHeight: '0px', marginRight: RIGHT_MARGIN, marginLeft: RIGHT_MARGIN}}
      ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Emojii set='google' emoji={name} size={16} sheetSize={16} />
    </span>
    {open && (
      <TooltipContent targetRef={ref}>
        <Text size='xsmall'>:{name}:</Text>
      </TooltipContent>
    )}
    </>
  )
}

function MessageEntity({entity}) {
  switch (entity.type) {
    case EntityType.MENTION:
      return <Mention text={entity.text} user={entity.user} />
    case EntityType.EMOJI:
      return <Emoji name={entity.text} />
    default:
      return null
  }
}


function* splitText(text, entities) {
  let lastIndex = 0
  const sorted = sortBy(entities, ({startIndex}) => startIndex)
  for (let entity of sorted) {
    const upTo = text.substring(lastIndex, entity.startIndex)
    if (upTo !== '') {
      yield upTo
    }
    yield `<MessageEntity id="${entity.id}" />`
    lastIndex = entity.endIndex
  }

  if (lastIndex < text.length) {
    yield text.substring(lastIndex)
  }
}

export default React.memo(({text, entities}) => {
  const parsed = [...splitText(text, entities || [])].join('')
  const entityMap = (entities || []).reduce((map, entity) => ({...map, [entity.id]: entity}), {})
  const Entity = ({id}) => <MessageEntity entity={entityMap[id]} />

  return (
    <Markdown
      components={{
        blockquote: {component: Blockquote},
        p: {props: {size: 'small', margin: {top: 'xsmall', bottom: 'xsmall'}, style: {maxWidth: '100%'}}},
        a: {props: {size: 'small', target: '_blank'}, component: Anchor},
        span: {props: {style: {verticalAlign: 'bottom'}}},
        code: {component: Code},
        pre: {component: Preformat},
        MessageEntity: {component: Entity}
      }}>
      {parsed}
    </Markdown>
  )
})