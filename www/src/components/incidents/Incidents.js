import React, { useContext, useEffect, useState } from 'react'
import { Box, Text, TextInput, ThemeContext } from 'grommet'
import { Loading, Scroller, Button } from 'forge-core'
import { useQuery } from 'react-apollo'
import { INCIDENTS_Q } from './queries'
import { extendConnection } from '../../utils/graphql'
import { RepoIcon } from '../repos/Repositories'
import moment from 'moment'
import { Severity } from './Severity'
import { useHistory, useParams } from 'react-router'
import { Add, Checkmark, Search } from 'grommet-icons'
import { Status } from './IncidentStatus'
import { BreadcrumbsContext } from '../Breadcrumbs'
import { CreateIncident } from './CreateIncident'
import styled, { keyframes } from 'styled-components';
import { pulse } from 'react-animations';
import { normalizeColor } from 'grommet/utils'

const pulseAnimation = keyframes`${pulse}`;

const BouncyDiv = styled.div`
  animation: 1s ${pulseAnimation} infinite;
`;

function Tags({tags}) {
  return (
    <Box direction='row' gap='xsmall' align='center'>
      {tags.map(({tag}) => (
        <Box round='xsmall' pad={{horizontal: 'xsmall', vertical: '2px'}} background='light-2'>
          <Text size='xsmall'>{tag}</Text>
        </Box>
      ))}
    </Box>
  )
}

export function NotificationBadge({size, color, count}) {
  const theme = useContext(ThemeContext)
  const background = color || 'error'

  return (
    <Box as={BouncyDiv} 
         style={{boxShadow: `0 0 3px ${normalizeColor(background, theme)}`}} 
         width={size} height={size} 
         align='center' justify='center'
         round='full' background={background}>
      {count && <Text size='10px'>{count > 10 ? '!!' : count}</Text>}
    </Box>
  )
}

export function IncidentRow({incident: {id, repository, title, insertedAt, owner, ...incident}, selected}) {
  let history = useHistory()

  return (
    <Box flex={false} fill='horizontal' pad='small' border={{side: 'horizontal', color: 'light-3'}} direction='row' 
        align='center' gap='xsmall' hoverIndicator='light-2' onClick={() => history.push(`/incidents/${id}`)}
        height='75px'>
      <RepoIcon repo={repository} />
      <Box fill='horizontal' direction='row' gap='xsmall' align='center'>
        <Box flex={false}>
          <Box direction='row' align='center' gap='small'>
            <Text size='small' weight={500}>{title}</Text>
            <Status incident={incident} />
            <Tags tags={incident.tags} />
            {incident.notificationCount > 0 && <NotificationBadge count={incident.notificationCount} size='15px' />}
          </Box>
          <Text size='small' color='light-5'>created: {moment(insertedAt).fromNow()}, {owner ? `responder: ${owner.email}` : 'unassigned'}</Text>
        </Box>
      </Box>
      <Severity incident={incident} />
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
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState(null)
  const {incidentId} = useParams()
  const {data, fetchMore} = useQuery(INCIDENTS_Q, {variables: {q}, fetchPolicy: 'cache-and-network'})
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{url: `/incidents`, text: 'incidents'}])
  }, [setBreadcrumbs])

  if (!data) return <Loading />

  const {incidents: {edges, pageInfo}} = data

  return (
    <Box fill>
      {!open && (
        <Box fill='horizontal' pad='small' align='center' direction='row' gap='xsmall' justify='end'>
          <Box fill='horizontal' border={{side: 'bottom', color: 'light-5'}}>
            <TextInput 
              plain
              icon={<Search size='15px' />}
              value={q}
              placeholder='search for an incident'
              onChange={({target: {value}}) => setQ(value)} />
          </Box>
          <Button label='Create' onClick={() => setOpen(true)} />
        </Box>
      )}
      {open && <CreateIncident onCompleted={() => setOpen(false)} />}
      <Box fill>
        <Scroller
          id='incidents'
          style={{width: '100%', height: '100%', overflow: 'auto'}}
          edges={edges}
          mapper={({node}, next) => <IncidentRow key={node.id} incident={node} next={next.node} selected={incidentId} />}
          onLoadMore={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult}) => extendConnection(prev, fetchMoreResult, 'incidents')
          })}
        />
      </Box>
    </Box>
  )
}