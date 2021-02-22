import React from 'react'
import { Loading } from 'forge-core'
import { useQuery } from 'react-apollo'
import { useParams } from 'react-router'
import Markdown from './Markdown'
import { INCIDENT_Q } from './queries'
import { Severity } from './Severity'
import { Box, Text } from 'grommet'

export function Incident() {
  const {incidentId} = useParams()
  const {data} = useQuery(INCIDENT_Q, {variables: {id: incidentId}, fetchPolicy: 'cache-and-network'})
  if (!data) return <Loading />
  const {incident} = data
  
  return (
    <Box fill>
      <Box pad='small' border='bottom' direction='row' align='center'>
        <Box fill='horizontal'>
          <Text size='small' weight={500}>{incident.title}</Text>
        </Box>
        <Severity severity={incident.severity} />
      </Box>
      <Box pad='small' border='bottom'>
        <Markdown text={incident.description || ''} />
      </Box>
    </Box>
  )
}
