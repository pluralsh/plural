import React, { useContext } from 'react'
import { CurrentUserContext } from '../login/CurrentUser'
import { useQuery } from 'react-apollo'
import { useHistory, useParams } from 'react-router'
import Markdown from './Markdown'
import { INCIDENT_Q } from './queries'
import { Severity } from './Severity'
import { Box, Text } from 'grommet'
import { Status } from './IncidentStatus'
import { Messages } from './Messages'
import { MessageInput } from './MessageInput'
import { dateFormat } from '../../utils/date'
import moment from 'moment'
import { Edit } from 'grommet-icons'

const canEdit = ({creator, owner}, {id}) => creator.id === id || owner.id === id

function EditButton({incidentId}) {
  let history = useHistory()
  return (
    <Box pad='xsmall' round='xsmall' hoverIndicator='light-3' 
         onClick={() => history.push(`/incidents/${incidentId}/edit`)}>
      <Edit size='small' color='dark-6' />
    </Box>
  )
}

export function Incident() {
  const {incidentId} = useParams()
  const currentUser = useContext(CurrentUserContext)
  const {data, loading, fetchMore} = useQuery(INCIDENT_Q, {variables: {id: incidentId}, fetchPolicy: 'cache-and-network'})

  if (!data) return null

  const {incident} = data
  const editable = canEdit(incident, currentUser)
  
  return (
    <Box fill gap='small' pad='small'>
      <Box flex={false} direction='row' align='center' gap='small'>
        <Severity severity={incident.severity} />
        <Box fill='horizontal' direction='row' align='center' gap='xsmall'>
          <Text size='small' weight={500}>{incident.title}</Text>
          <Status incident={incident} />
        </Box>
      </Box>
      <Box flex={false} border={{color: 'light-4'}} round='xsmall'>
        <Box direction='row' align='center' background='light-1' pad={{vertical: 'xsmall', horizontal: 'small'}} 
             border={{side: 'bottom', color: 'light-3'}} round={{corner: 'top', size: 'xsmall'}}>
          <Box fill='horizontal' direction='row' gap='xsmall'>
            <Text size='small' weight='bold'>{incident.creator.name}</Text>
            <Text size='small'>created {dateFormat(moment(incident.insertedAt))}</Text>
          </Box>
          {editable && <EditButton incidentId={incidentId} />}
        </Box>
        <Box flex={false} pad='small' round='xsmall'>
          <Markdown text={incident.description || ''} />
        </Box>
      </Box>
      <Box fill>
        <Messages incident={incident} fetchMore={fetchMore} loading={loading} />
      </Box>
      <MessageInput />
    </Box>
  )
}
