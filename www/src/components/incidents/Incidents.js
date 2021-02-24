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
import { Add, Checkmark } from 'grommet-icons'
import { Status } from './IncidentStatus'

function IncidentRow({incident: {id, repository, title, insertedAt, severity, ...incident}, next, selected}) {
  let history = useHistory()

  return (
    <Box fill='horizontal' pad='small' border={next ? {side: 'bottom', color: 'light-3'} : null} direction='row' 
        align='center' gap='xsmall' hoverIndicator='light-2' onClick={() => history.push(`/incidents/${id}`)}
        height='75px'>
      <RepoIcon repo={repository} />
      <Box fill='horizontal'>
        <Box direction='row' align='center' gap='xsmall'>
          <Text size='small' weight={500}>{title}</Text>
          <Status incident={incident} />
        </Box>
        <Text size='small' color='light-5'>created: {moment(insertedAt).fromNow()}</Text>
      </Box>
      <Severity severity={severity} />
      {id === selected && <Checkmark color='brand' size='15px' />}
    </Box>
  )
}

export function IncidentSidebar({incidents: {edges, pageInfo}, fetchMore}) {
  let history = useHistory()
  const {incidentId} = useParams()

  return (
    <Box fill='vertical' width='400px' border={{side: 'right', color: 'light-5'}}>
      <Box height='50px' fill='horizontal' pad='small' direction='row' gap='xsmall'
            onClick={() => history.push('/incidents/create')} hoverIndicator='light-2' 
            border={{side: 'bottom', color: 'light-5'}} align='center'>
        <Add size='small' />
        <Text size='small'>Create Incident</Text>
      </Box>
      <Scroller
        id='incidents'
        style={{width: '100%', height: '100%', overflow: 'auto', display: 'flex'}}
        edges={edges}
        mapper={({node}, next) => <IncidentRow key={node.id} incident={node} next={next.node} selected={incidentId} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult}) => extendConnection(prev, fetchMoreResult, 'incidents')
        })}
      />
    </Box>
  )
}

export function Incidents() {
  const {incidentId} = useParams()
  const {data, fetchMore} = useQuery(INCIDENTS_Q, {fetchPolicy: 'cache-and-network'})
  if (!data) return <Loading />

  return (
    <Box fill direction='row' gap='0px'>
      <IncidentSidebar incidents={data.incidents} fetchMore={fetchMore} />
      {incidentId && <Incident />}
    </Box>
  )
}