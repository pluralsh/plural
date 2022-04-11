import React, { useState } from 'react'
import { Messages as ForgeMessages } from 'forge-core'
import { Box, Text } from 'grommet'

import SmoothScroller from '../utils/SmoothScroller'

import { extendConnection } from '../../utils/graphql'

import { Message } from './Message'

function Empty() {
  return (
    <Box
      width="100%"
      height="100%"
      pad="medium"
      gap="small"
      align="center"
      justify="center"
    >
      <ForgeMessages size="40px" />
      <Text size="small">Get the conversation started</Text>
    </Box>
  )
}

export function Messages({ incident: { messages: { pageInfo: { hasNextPage, endCursor }, edges } }, loading, fetchMore }) {
  const [listRef, setListRef] = useState(null)

  if (edges.length === 0) return <Empty />

  return (
    <SmoothScroller
      listRef={listRef}
      setListRef={setListRef}
      items={edges}
      mapper={({ node }) => <Message message={node} />}
      loading={loading}
      loadNextPage={() => hasNextPage && fetchMore({
        variables: { cursor: endCursor },
        updateQuery: (prev, { fetchMoreResult: { incident: { messages } } }) => ({
          ...prev, incident: extendConnection(prev.incident, messages, 'messages'),
        }),
      })}
      hasNextPage={hasNextPage}
    />
  )
}
