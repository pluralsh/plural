import { cloneElement, memo, useContext, useRef, useState } from 'react'
import { Anchor, Box, Drop, Markdown, Text, ThemeContext } from 'grommet'
import { Copy, TooltipContent, WithCopy } from 'forge-core'
import Highlight from 'react-highlight.js'
import hljs from 'highlight.js'
import { normalizeColor } from 'grommet/utils'
import sortBy from 'lodash.sortby'
import { Emoji as Emojii } from 'emoji-mart'

import Avatar from '../users/Avatar'

import { EntityType } from './types'

function Blockquote({ children }) {
  return (
    <Box
      border={{ side: 'left', size: '2px', color: 'border' }}
      pad={{ horizontal: 'small' }}
    >
      {children}
    </Box>
  )
}

// DEPRECATED in favor of utils/Code
export function Code({ children, header, className, multiline }) {
  const theme = useContext(ThemeContext)

  if (className && className.startsWith('lang-')) {

    const lang = className && className.slice(5)

    if (hljs.getLanguage(lang)) {
      return (
        <Box
          fill="horizontal"
          round="xxsmall"
          background="#2e3440"
          border={{ color: 'border' }}
        >
          <Box
            fill="horizontal"
            border={{ side: 'bottom', color: 'border' }}
            direction="row"
            justify="end"
            gap="xsmall"
            background="fill-one"
            pad="xsmall"
            align="center"
          >
            {header && (
              <Box fill="horizontal">
                <Text
                  size="small"
                  weight={500}
                >
                  {header}
                </Text>
              </Box>
            )}
            <Text
              size="small"
              weight={500}
              color="text-weak"
            >
              language:
            </Text>
            <Text
              size="small"
              color="text-weak"
            >
              {lang}
            </Text>
            <WithCopy
              text={children}
              pillText={`copied ${lang} contents`}
            >
              <Copy
                style={{ cursor: 'pointer' }}
                size="small"
                color="text-weak"
              />
            </WithCopy>
          </Box>
          <Highlight language={lang}>{children}</Highlight>
        </Box>
      )
    }
  }

  return (
    <span>
      <Box
        flex={false}
        style={{ display: 'inline-block', color: multiline ? null : normalizeColor('notif', theme) }}
        pad={multiline ? 'xsmall' : { horizontal: 'xxsmall' }}
        round="xxsmall"
        border={{ color: 'border' }}
        background="light-2"
      >
        <pre>
          <code>{children}</code>
        </pre>
      </Box>
    </span>
  )
}

function Preformat({ children }) {
  return (
    <Box
      flex={false}
      pad={{ vertical: 'xsmall' }}
    >
      {cloneElement(children, { multiline: true })}
    </Box>
  )
}

function Mention({ text, user }) {
  const ref = useRef()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Box
        ref={ref}
        style={{ display: 'inline-block' }}
        round="xsmall"
        background="fill-one"
        focusIndicator={false}
        pad={{ horizontal: 'xxsmall' }}
        onClick={() => setOpen(!open)}
        hoverIndicator="border"
      >
        <Text
          size="small"
          weight={500}
        >@{text}
        </Text>
      </Box>
      {open && (
        <Drop
          target={ref.current}
          align={{ bottom: 'top' }}
          onClickOutside={() => setOpen(false)}
        >
          <Box
            direction="row"
            gap="xsmall"
            align="center"
            pad={{ horizontal: 'small', vertical: 'xsmall' }}
          >
            <Avatar
              user={user}
              size="30px"
            />
            <Text
              size="small"
              weight={500}
            >{user.name}
            </Text>
            <Text
              size="small"
              color="dark-5"
            >-- {user.email}
            </Text>
          </Box>
        </Drop>
      )}
    </>
  )
}

const RIGHT_MARGIN = '3px'

function Emoji({ name }) {
  const ref = useRef()
  const [open, setOpen] = useState(false)

  return (
    <>
      <span
        style={{
          display: 'inline-block',
          alignItems: 'center',
          height: '16px',
          width: '16px',
          lineHeight: '0px',
          marginRight: RIGHT_MARGIN,
          marginLeft: RIGHT_MARGIN }}
        ref={ref}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Emojii
          set="google"
          emoji={name}
          size={16}
          sheetSize={16}
        />
      </span>
      {open && (
        <TooltipContent targetRef={ref}>
          <Text size="xsmall">:{name}:</Text>
        </TooltipContent>
      )}
    </>
  )
}

function MessageEntity({ entity }) {
  switch (entity.type) {
    case EntityType.MENTION:
      return (
        <Mention
          text={entity.text}
          user={entity.user}
        />
      )
    case EntityType.EMOJI:
      return <Emoji name={entity.text} />
    default:
      return null
  }
}

function* splitText(text, entities) {
  let lastIndex = 0
  const sorted = sortBy(entities, ({ startIndex }) => startIndex)
  for (const entity of sorted) {
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

export default memo(({ text, entities }) => {
  const parsed = [...splitText(text, entities || [])].join('')
  const entityMap = (entities || []).reduce((map, entity) => ({ ...map, [entity.id]: entity }), {})
  function Entity({ id }) {
    return <MessageEntity entity={entityMap[id]} />
  }

  return (
    <Markdown
      components={{
        blockquote: { component: Blockquote },
        p: { props: { size: 'small', margin: { top: 'xsmall', bottom: 'xsmall' }, style: { maxWidth: '100%' } } },
        a: { props: { size: 'small', target: '_blank' }, component: Anchor },
        span: { props: { style: { verticalAlign: 'bottom' } } },
        code: { component: Code },
        pre: { component: Preformat },
        MessageEntity: { component: Entity },
      }}
    >
      {parsed}
    </Markdown>
  )
})
