import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'
import { Box, Text, TextInput } from 'grommet'
import { Aid, Search } from 'grommet-icons'
import { Scroller } from 'forge-core'
import { INCIDENTS_Q, REPOS_Q } from './queries'
import { extendConnection } from '../../utils/graphql'
import { RepoOption } from './CreateIncident'
import { FilterSelect, IncidentRow, IncidentToolbar, IncidentViewContext } from './Incidents'
import { IncidentSort, Order } from './types'

function Repositories({repository, setRepository}) {
  const {data, fetchMore} = useQuery(REPOS_Q, {fetchPolicy: 'cache-and-network'})
  useEffect(() => {
    if (!repository && data && data.repositories) {
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
        updateQuery: (prev, {fetchMoreResult: {incidents}}) => extendConnection(prev, incidents, 'incidents')
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
  const {q, setQ, sort, order, filters} = useContext(IncidentViewContext)
  const {data, fetchMore} = useQuery(INCIDENTS_Q, {
    variables: {repositoryId: id, q, sort, order, filters},
    fetchPolicy: 'cache-and-network'
  })

  if (!data) return null

  const {edges, pageInfo} = data.incidents

  return (
    <Box fill>
      <Box fill='horizontal' pad='small' align='center' direction='row' gap='xsmall' justify='end'>
        <Box fill='horizontal'>
          <TextInput 
            plain
            icon={<Search size='15px' />}
            value={q}
            placeholder='search for an incident'
            onChange={({target: {value}}) => setQ(value)} />
        </Box>
        <FilterSelect />
      </Box>
      <IncidentToolbar />
      <Box fill>
        <Scroller
          id='incidents'
          style={{width: '100%', height: '100%', overflow: 'auto'}}
          edges={edges}
          emptyState={<EmptyState />}
          mapper={({node}, next) => <IncidentRow key={node.id} incident={node} next={next.node} />}
          onLoadMore={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult: {incidents}}) => extendConnection(prev, incidents, 'incidents')
          })}
        />
      </Box>
    </Box>
  )
}

export function Responses() {
  const [q, setQ] = useState(null)
  const [sort, setSort] = useState(IncidentSort.INSERTED_AT)
  const [order, setOrder] = useState(Order.DESC)
  const [filters, setFilters] = useState([])
  const [repository, setRepository] = useState(null)
  
  return (
    <IncidentViewContext.Provider value={{q, setQ, sort, setSort, order, setOrder, filters, setFilters}}>
    <Box direction='row' fill>
      <Box width='30%' fill='vertical' border={{side: 'right', color: 'light-5'}}>
        <Repositories repository={repository} setRepository={setRepository} />
      </Box>
      <Box width='70%' fill='vertical'>
        {repository && <Incidents repository={repository} />}
      </Box>
    </Box>
    </IncidentViewContext.Provider>
  )
}