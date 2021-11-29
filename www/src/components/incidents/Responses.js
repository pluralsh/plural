import React, { useCallback, useContext, useState } from 'react'
import { useQuery } from 'react-apollo'
import { Box, Text, TextInput } from 'grommet'
import { Explore as Search, Incidents as IncidentsI, Bundle } from 'forge-core'
import { INCIDENTS_Q, REPOS_Q } from './queries'
import { extendConnection } from '../../utils/graphql'
import { RepoOption } from './CreateIncident'
import { FilterSelect, IncidentRow, IncidentToolbar, IncidentViewContext } from './Incidents'
import { IncidentSort, Order } from './types'
import { RepoIcon } from '../repos/Repositories'
import { StandardScroller } from '../utils/SmoothScroller'
import { ReturnToBeginning } from '../utils/ReturnToBeginning'

const Placeholder = () => <Box fill='horizontal' flex={false} height='50px' />

function Repositories({repository, setRepository}) {
  const [listRef, setListRef] = useState(null)
  const {data, fetchMore} = useQuery(REPOS_Q, {fetchPolicy: 'cache-and-network'})

  if (!data) return null

  const {edges, pageInfo} = data.repositories

  return (
    <Box fill>
      <StandardScroller
        listRef={listRef}
        setListRef={setListRef}
        items={edges}
        placeholder={Placeholder}
        mapper={({node}) => <RepoOption key={node.id} repo={node} selected={repository} setRepository={setRepository} />}
        loadNextPage={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {repositories}}) => extendConnection(prev, repositories, 'repositories')
        })}
        hasNextPage={pageInfo.hasNextPage}
      />
    </Box>
  )
}

function EmptyState() {
  return (
    <Box fill align='center' justify='center'>
      <Box flex={false} pad='medium' round='small' gap='xsmall'>
        <Box fill='horizontal' align='center'>
          <IncidentsI size='medium' />
        </Box>
        <Text size='small' weight={500}>No incidents yet...</Text>
      </Box>
    </Box>
  )
}

function Incidents({repository, setSelect, select}) {
  const [listRef, setListRef] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const {q, setQ, sort, order, filters} = useContext(IncidentViewContext)
  const {data, fetchMore} = useQuery(INCIDENTS_Q, {
    variables: {repositoryId: repository && repository.id, q, sort, order, filters, supports: true},
    fetchPolicy: 'cache-and-network'
  })

  const returnToBeginning = useCallback(() => {
    listRef.scrollToItem(0)
  }, [listRef])

  if (!data) return null

  const {edges, pageInfo} = data.incidents

  return (
    <Box fill>
      <Box fill='horizontal' pad='small' align='center' direction='row' gap='xsmall' justify='end'>
        <FilterSelect />
        <Box fill='horizontal'>
          <TextInput 
            plain
            icon={<Search size='15px' />}
            value={q}
            placeholder='search for an incident'
            onChange={({target: {value}}) => setQ(value)} />
        </Box>
      </Box>
      <IncidentToolbar>
        <Box fill='horizontal' direction='row' align='center' gap='xsmall' 
             round='xsmall' onClick={() => setSelect(!select)}>
          {repository && <RepoIcon repo={repository} size='20px' />}
          {!repository && <Bundle size='15px' />}
          <Text size='small'>filter repository</Text>
        </Box>
      </IncidentToolbar>
      <Box fill>
        {scrolled && <ReturnToBeginning beginning={returnToBeginning} />}
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          items={edges}
          emptyState={<EmptyState />}
          placeholder={Placeholder}
          handleScroll={setScrolled}
          mapper={({node}, next) => <IncidentRow key={node.id} incident={node} next={next.node} />}
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult: {incidents}}) => extendConnection(prev, incidents, 'incidents')
          })}
          hasNextPage={pageInfo.hasNextPage}
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
  const [select, setSelect] = useState(false)
  const doSetRepository = useCallback((repo) => {
    setRepository(repo.id === (repository && repository.id) ? null : repo)
    setSelect(false)
  }, [setRepository, setSelect, repository])
  
  return (
    <IncidentViewContext.Provider value={{q, setQ, sort, setSort, order, setOrder, filters, setFilters}}>
    <Box direction='row' fill>
      {select && (
        <Box flex={false} width='30%' fill='vertical' border={{side: 'right', color: 'light-5'}}>
          <Repositories repository={repository} setRepository={doSetRepository} />
        </Box>
      )}
      <Box fill>
        <Incidents setSelect={setSelect} select={select} repository={repository} />
      </Box>
    </Box>
    </IncidentViewContext.Provider>
  )
}