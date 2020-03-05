import React, { useState } from 'react'
import Scroller from '../utils/Scroller'
import { Text, Box, Keyboard, TextInput } from 'grommet'
import { Tag as TagInner } from '../utils/TagInput'

export function TagInput({addTag, removeTag, tags, round, ...rest}) {
  const [current, setCurrent] = useState("")
  return (
    <Keyboard onEnter={() => {
      addTag(current)
      setCurrent("")
    }}>
      <Box fill='horizontal' direction="row" align="center" border="all" round={round || 'xsmall'}>
        <Box direction='row' wrap align='center'>
          {tags.length > 0 && tags.map((tag, index) => (
            <TagInner margin="xxsmall" key={`${tag}${index}`} onRemove={() => removeTag(tag)}>
              {tag}
            </TagInner>
          ))}
        </Box>
        <Box flex style={{ minWidth: "120px" }}>
          <TextInput
            type="search"
            plain
            onChange={({target: {value}}) => setCurrent(value)}
            value={current}
            {...rest}
          />
        </Box>
      </Box>
    </Keyboard>
  )
}

export function TagContainer({enabled, children, gap, pad, onClick}) {
  const [hover, setHover] = useState(false)
  const border = (hover || enabled) ? {side: 'right', color: 'focus', size: '2px'} : null
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={onClick && {cursor: 'pointer'}}
      pad={pad || {horizontal: 'small', vertical: 'xxsmall'}}
      background={hover ? 'light-2' : null}
      direction='row'
      align='center'
      gap={gap || 'xsmall'}
      border={border}
      onClick={onClick} >
      {children}
    </Box>
  )
}

function Tag({tag, count, setTag, enabled}) {
  return (
    <TagContainer enabled={enabled} onClick={() => setTag && setTag(tag)}>
      <Text size='small'># {tag} ({count})</Text>
    </TagContainer>
  )
}

export default function Tags({tags: {pageInfo, edges}, fetchMore, tag, setTag, pad}) {
  return (
    <Box pad={pad || {vertical: 'medium'}} height='100%' gap='small'>
      <Scroller
        edges={edges}
        style={{overflow: 'auto', height: '100%', width: '100%'}}
        mapper={({node}) => <Tag key={node.tag} {...node} setTag={setTag} enabled={node.tag === tag} />}
        onLoadMore={() => {
          if (!pageInfo.hasNextPage) return

          fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult}) => {
              const {edges, pageInfo} = fetchMoreResult.tags
              return edges.length ? {
                ...prev,
                tags: {
                  ...prev.tags,
                  pageInfo,
                  edges: [...prev.tags.edges, ...edges]
                }
              } : prev
            }
          })
        }}
      />
    </Box>
  )
}