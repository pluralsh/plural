import React from 'react'
import { Box, Text } from 'grommet'
import { Loading, Scroller } from 'forge-core'
import { useQuery } from 'react-apollo'
import { INCIDENTS_Q } from './queries'
import { extendConnection } from '../../utils/graphql'
import { RepoIcon } from '../repos/Repositories'
import moment from 'moment'
import { Severity } from './Severity'
import { Incident } from './Incident'
import { useHistory, useParams } from 'react-router'
import { Add } from 'grommet-icons'

function IncidentRow({incident: {id, repository, title, insertedAt, severity}, next}) {
  let history = useHistory()

  return (
    <Box pad='small' border={next ? {side: 'bottom', color: 'light-3'} : null} direction='row' 
         align='center' gap='xsmall' hoverIndicator='light-2' onClick={() => history.push(`/incidents/${id}`)}>
      <RepoIcon repo={repository} />
      <Box>
        <Text size='small' weight={500}>{title}</Text>
        <Text size='small' color='light-5'>created: {moment(insertedAt).fromNow()}</Text>
      </Box>
      <Severity severity={severity} />
    </Box>
  )
}

export function Incidents() {
  const {incidentId} = useParams()
  let history = useHistory()
  const {data, fetchMore} = useQuery(INCIDENTS_Q, {fetchPolicy: 'cache-and-network'})
  if (!data) return <Loading />

  const {incidents: {edges, pageInfo}} = data
  return (
    <Box fill direction='row' gap='0px' border={{side: 'between', color: 'light-5'}}>
      <Box gap='small' fill='vertical' width='400px'>
        <Box height='50px' fill='horizontal' pad='small' direction='row' gap='xsmall'
             onClick={() => history.push('/incidents/create')} hoverIndicator='light-2' 
             border={{side: 'bottom', color: 'light-5'}}>
          <Add size='small' />
          <Text size='small'>Create Incident</Text>
        </Box>
        <Scroller
          id='incidents'
          style={{height: '100%', overflow: 'auto', display: 'flex'}}
          edges={edges}
          mapper={({node}, next) => <IncidentRow key={node.id} incident={node} next={next.node} />}
          onLoadMore={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult}) => extendConnection(prev, fetchMoreResult, 'incidents')
          })}
        />
      </Box>
      {incidentId && <Incident />}
    </Box>
  )
}