import React from 'react'
import Scroller from '../utils/Scroller'
import { Anchor, Text, Box } from 'grommet'

function Tag({tag, count, setTag}) {
  return (
    <Box direction='row' gap='xsmall' pad={{bottom: 'xsmall'}}>
      <Anchor onClick={() => setTag && setTag(tag)} size='small'>#{tag}</Anchor>
      <Text size='small'>({count})</Text>
    </Box>
  )
}

export default function Tags({tags: {pageInfo, edges}, fetchMore, setTag}) {
  return (
    <Box pad='medium' height='100%' gap='small'>
      <Text style={{fontWeight: 500}}>Tags</Text>
      <Scroller
        edges={edges}
        style={{overflow: 'auto', height: '100%', width: '100%'}}
        mapper={({node}) => <Tag {...node} setTag={setTag} />}
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