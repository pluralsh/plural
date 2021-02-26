import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CurrentUserContext } from '../login/CurrentUser'
import { useMutation, useQuery } from 'react-apollo'
import { useHistory, useParams } from 'react-router'
import Markdown from './Markdown'
import { INCIDENT_Q, UPDATE_INCIDENT } from './queries'
import { Severity } from './Severity'
import { Box, Text } from 'grommet'
import { Status } from './IncidentStatus'
import { MessageInput } from './MessageInput'
import { dateFormat } from '../../utils/date'
import moment from 'moment'
import { Chat, Edit } from 'grommet-icons'
import SmoothScroller from '../utils/SmoothScroller'
import { Message } from './Message'
import { extendConnection } from '../../utils/graphql'
import { BreadcrumbsContext } from '../Breadcrumbs'

export const canEdit = ({creator, owner}, {id}) => creator.id === id || owner.id === id

function EditButton({incidentId}) {
  let history = useHistory()
  return (
    <Box pad='xsmall' round='xsmall' hoverIndicator='light-3' 
         onClick={() => history.push(`/incidents/${incidentId}/edit`)}>
      <Edit size='small' color='dark-6' />
    </Box>
  )
}

function Empty() {
  return (
    <Box fill pad='medium' gap='small' align='center' justify='center' round='xsmall'>
      <Chat size='40px' />
      <Text size='small'>Get the conversation started</Text>
    </Box>
  )
}

function IncidentHeader({incident, editable}) {
  return (
    <Box flex={false} border={{color: 'light-4'}} margin={{bottom: 'small'}}>
      <Box direction='row' align='center' background='light-1' pad={{vertical: 'xsmall', horizontal: 'small'}} 
            border={{side: 'bottom', color: 'light-3'}} round={{corner: 'top', size: 'xsmall'}}>
        <Box fill='horizontal' direction='row' gap='xsmall'>
          <Text size='small' weight='bold'>{incident.creator.name}</Text>
          <Text size='small'>created on {dateFormat(moment(incident.insertedAt))}</Text>
        </Box>
        {editable && <EditButton incidentId={incident.id} />}
      </Box>
      <Box flex={false} pad='small' round='xsmall'>
        <Markdown text={incident.description || ''} />
      </Box>
    </Box>
  )
}

export function Messages({incident, loading, fetchMore}) {
  const [listRef, setListRef] = useState(null)
  const currentUser = useContext(CurrentUserContext)
  const editable = canEdit(incident, currentUser)

  const {messages: {pageInfo: {hasNextPage, endCursor}, edges}} = incident
  
  const entries = useMemo(() => {
    if (edges.length === 0) return [['i', incident], ['empty', null]]
    return [['i', incident], ...edges.map((e) => ['e', e])]
  }, [edges, incident])
  
  const mapper = useCallback(([t, e]) => {
    switch (t) {
      case 'i':
        return <IncidentHeader incident={e} editable={editable} />
      case 'e':
        return <Message message={e.node} />
      default:
        return <Empty />
    }
  }, [editable])

  return (
    <SmoothScroller
      listRef={listRef}
      setListRef={setListRef}
      items={entries}
      mapper={mapper}
      loading={loading}
      loadNextPage={() => hasNextPage && fetchMore({
        variables: {cursor: endCursor},
        updateQuery: (prev, {fetchMoreResult: {incident: {messages}}}) => ({
          ...prev, incident: {...prev.incident, messages: extendConnection(prev.incident.messages, messages)},
        })
      })}
      hasNextPage={hasNextPage} />
  )
}

export function Incident() {
  const {incidentId} = useParams()
  const {data, loading, fetchMore} = useQuery(INCIDENT_Q, {variables: {id: incidentId}, fetchPolicy: 'cache-and-network'})
  const [mutation] = useMutation(UPDATE_INCIDENT, {variables: {id: incidentId}})
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([{url: `/incidents`, text: 'incidents'}, {url: `/incidents/${incidentId}`, text: incidentId}])
  }, [setBreadcrumbs, incidentId])

  if (!data) return null

  const {incident} = data
  
  return (
    <Box fill gap='small'>
      <Box flex={false} pad='small' direction='row' align='center' gap='small' border={{side: 'bottom', color: 'light-5'}}>
        <Severity incident={incident} setSeverity={(severity) => mutation({variables: {attributes: {severity}}})} />
        <Box fill='horizontal' direction='row' align='center' gap='xsmall'>
          <Text size='small' weight={500}>{incident.title}</Text>
        </Box>
        <Status incident={incident} setActive={(status) => mutation({variables: {attributes: {status}}})} />
      </Box>
      <Box fill pad={{horizontal: 'small'}}>
        <Messages incident={incident} fetchMore={fetchMore} loading={loading} />
      </Box>
      <MessageInput />
    </Box>
  )
}
