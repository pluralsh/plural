import {
  cloneElement,
  memo,
  useRef,
  useState,
} from 'react'
import {
  Anchor,
  Box,
  Drop,
  Markdown,
  Text,
} from 'grommet'
import { TooltipContent } from 'forge-core'
import sortBy from 'lodash/sortBy'
import { Emoji as Emojii } from 'emoji-mart'

import { Code } from 'pluralsh-design-system'

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
          marginLeft: RIGHT_MARGIN,
        }}
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
