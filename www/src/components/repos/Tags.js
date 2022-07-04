import { useState } from 'react'
import { Box, Keyboard, Text, TextInput } from 'grommet'
import { Scroller, Tag as TagInner } from 'forge-core'

import { extendConnection } from '../../utils/graphql'

export function TagInput({ addTag, removeTag, tags, round, ...rest }) {
  const [current, setCurrent] = useState('')

  return (
    <Keyboard onEnter={() => {
      addTag(current)
      setCurrent('')
    }}
    >
      <Box
        fill="horizontal"
        direction="row"
        align="center"
        round={round || 'xsmall'}
      >
        <Box
          direction="row"
          wrap
          align="center"
        >
          {tags.length > 0 && tags.map((tag, index) => (
            <TagInner
              margin="xxsmall"
              key={`${tag}${index}`}
              onRemove={() => removeTag(tag)}
            >
              {tag}
            </TagInner>
          ))}
        </Box>
        <Box
          flex
          style={{ minWidth: '120px' }}
        >
          <TextInput
            type="search"
            plain
            placeholder="enter tags for this resource"
            onChange={({ target: { value } }) => setCurrent(value)}
            value={current}
            {...rest}
          />
        </Box>
      </Box>
    </Keyboard>
  )
}

export function TagContainer({ enabled, children, gap, pad, onClick }) {
  const border = enabled ? { side: 'right', color: 'focus', size: '2px' } : null

  return (
    <Box
      pad={pad || { horizontal: 'xsmall' }}
      border={border}
    >
      <Box
        hoverIndicator="fill-one"
        focusIndicator={false}
        direction="row"
        align="center"
        round="xsmall"
        pad="xsmall"
        gap={gap || 'xsmall'}
        onClick={onClick}
      >
        {children}
      </Box>
    </Box>
  )
}

export function Tag({ tag: { tag, count }, setTag, enabled }) {
  return (
    <TagContainer
      enabled={enabled}
      onClick={() => setTag && setTag(tag)}
    >
      <Text size="small">
        # {tag} ({count})
      </Text>
    </TagContainer>
  )
}

export default function Tags({ tags: { pageInfo, edges }, fetchMore, tag, setTag, pad }) {
  return (
    <Box
      pad={pad || { vertical: 'medium' }}
      height="100%"
      gap="small"
    >
      <Scroller
        edges={edges}
        style={{ overflow: 'auto', height: '100%', width: '100%' }}
        mapper={({ node }) => (
          <Tag
            key={node.tag}
            tag={node}
            setTag={setTag}
            enabled={node.tag === tag}
          />
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { tags } }) => extendConnection(prev, tags, 'tags'),
        })}
      />
    </Box>
  )
}
