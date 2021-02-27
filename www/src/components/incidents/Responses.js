import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'
import { Box, Text } from 'grommet'
import { Aid } from 'grommet-icons'
import { Scroller } from 'forge-core'
import { INCIDENTS_Q, REPOS_Q } from './queries'
import { extendConnection } from '../../utils/graphql'
import { RepoOption } from './CreateIncident'
import { IncidentRow } from './Incidents'

function Repositories({repository, setRepository}) {
  const {data, fetchMore} = useQuery(REPOS_Q, {fetchPolicy: 'cache-and-network'})
  useEffect(() => {
    if (!repository && data && data.repositories) {
      console.log(data)
      const edge = data.repositories.edges[0]
      setRepository(edge && edge.node)
    }
  }, [repository, setRepository, data])

  if (!data || !repository) return null

  const {edges, pageInfo} = data.repositories

  return (
    <Scroller
      id='repos'
      style={{width: '100%', height: '100%', overflow: 'auto'}}
      edges={edges}
      mapper={({node}) => <RepoOption key={node.id} repo={node} selected={repository} setRepository={setRepository} />}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: {cursor: pageInfo.endCursor},
        updateQuery: (prev, {fetchMoreResult}) => extendConnection(prev, fetchMoreResult, 'incidents')
      })}
    />
  )
}

function EmptyState() {
  return (
    <Box fill align='center' justify='center'>
      <Box flex={false} pad='medium' round='small' border={{color: 'light-5'}}>
        <Box fill='horizontal' align='center'>
          <Aid size='medium' />
        </Box>
        <Text size='small' weight={500}>No incidents yet...</Text>
      </Box>
    </Box>
  )
}

function Incidents({repository: {id}}) {
  const {data, fetchMore} = useQuery(INCIDENTS_Q, {
    variables: {repositoryId: id},
    fetchPolicy: 'cache-and-network'
  })

  if (!data) return null

  const {edges, pageInfo} = data.incidents

  return (
    <Scroller
      id='incidents'
      style={{width: '100%', height: '100%', overflow: 'auto'}}
      edges={edges}
      emptyState={<EmptyState />}
      mapper={({node}, next) => <IncidentRow key={node.id} incident={node} next={next.node} />}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: {cursor: pageInfo.endCursor},
        updateQuery: (prev, {fetchMoreResult}) => extendConnection(prev, fetchMoreResult, 'incidents')
      })}
    />
  )
}

export function Responses() {
  const [repository, setRepository] = useState(null)
  
  return (
    <Box direction='row' fill>
      <Box width='30%' fill='vertical' border={{side: 'right', color: 'light-5'}}>
        <Repositories repository={repository} setRepository={setRepository} />
      </Box>
      <Box width='70%' fill='vertical'>
        {repository && <Incidents repository={repository} />}
      </Box>
    </Box>
  )
}