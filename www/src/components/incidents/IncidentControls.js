import React from 'react'
import { Box, Text } from 'grommet'
import { AddCircle } from 'grommet-icons'
import { useMutation } from 'react-apollo'
import Avatar from '../users/Avatar'
import { ACCEPT_INCIDENT } from './queries'

function Control({icon, onClick}) {
  return (
    <Box pad='xsmall' round='xsmall' hoverIndicator='light-3' onClick={onClick}>
      {icon}
    </Box>
  )
}

function AcceptIncident({incident: {id}}) {
  const [mutation] = useMutation(ACCEPT_INCIDENT, {variables: {id}})
  
  return <Control icon={<AddCircle size='small' />} onClick={mutation} />
}

export function IncidentControls({incident}) {
  return (
    <Box flex={false} direction='row' gap='xsmall' align='center'>
      {!incident.owner && <AcceptIncident incident={incident} />}
    </Box>
  )
}