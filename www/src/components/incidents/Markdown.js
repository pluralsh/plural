import React, { useContext } from 'react'
import { Markdown, Box, Text, Anchor, ThemeContext } from "grommet"
import { WithCopy } from 'forge-core'
import { Copy } from 'grommet-icons'
import Highlight from 'react-highlight.js'
import hljs from 'highlight.js'
import { EntityType } from './types'
import { normalizeColor } from 'grommet/utils'
import { sortBy } from 'lodash'

function Blockquote({children}) {
  return (
    <Box border={{side: 'left', size: '2px', color: 'light-6'}} pad={{horizontal: 'small'}}>
      {children}
    </Box>
  )
}

function Code({children, className, multiline}) {
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

function Mention({text}) {
  return (
    <Box style={{display: 'inline-block'}} round='xsmall' background='light-3' pad={{horizontal: 'xxsmall'}}>
      <Text size='small' weight={500}>@{text}</Text>
    </Box>
  )
}

function MessageEntity({entity}) {
  switch (entity.type) {
    case EntityType.MENTION:
      return <Mention text={entity.text} />
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

export default React.memo(({text}) => {
  // const parsed = [...splitText(text, entities)].join('')
  // const entityMap = entities.reduce((map, entity) => ({...map, [entity.id]: entity}), {})
  // const Entity = ({id}) => <MessageEntity entity={entityMap[id]} />

  return (
    <Markdown
      components={{
        blockquote: {component: Blockquote},
        p: {props: {size: 'small', margin: {top: 'xsmall', bottom: 'xsmall'}, style: {maxWidth: '100%'}}},
        a: {props: {size: 'small', target: '_blank'}, component: Anchor},
        span: {props: {style: {verticalAlign: 'bottom'}}},
        code: {component: Code},
        pre: {component: Preformat}
      }}>
      {text}
    </Markdown>
  )
})