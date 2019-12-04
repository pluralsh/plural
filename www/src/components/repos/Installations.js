import React from 'react'
import {Box, Text} from 'grommet'
import {useQuery} from 'react-apollo'
import {INSTALLATIONS_Q} from './queries'
import {Repository} from './Repositories'
import Scroller from '../utils/Scroller'

function NoInstallations() {
  return (
    <Box>
      <Text size='small'>
        It looks like you have not installed anything.  Try searching for repositories,
      or browsing the available publishers.
      </Text>
    </Box>
  )
}

export default function Installations() {
  const {data, loading, fetchMore} = useQuery(INSTALLATIONS_Q)

  if (!data || loading) return null
  const {edges, pageInfo} = data.installations

  return (
    <Box gap='small' fill='horizontal'>
      <Scroller
        id='installations'
        edges={edges}
        style={{overflow: 'auto', width: '100%'}}
        emptyState={<NoInstallations />}
        mapper={({node}, next) => <Repository key={node.id} repo={node.repository} hasNext={!!next.node} />}
        onLoadMore={() => {
          if (!pageInfo.hasNextPage) return

          fetchMore({
            variables: {chartCursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult}) => {
              const {edges, pageInfo} = fetchMoreResult.installations
              return edges.length ? {
                ...prev,
                installations: {
                  ...prev.installations,
                  pageInfo,
                  edges: [...prev.installations.edges, ...edges]
                }
              } : prev
            }
          })
        }} />
    </Box>
  )
}