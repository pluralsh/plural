import React from 'react'
import { Box, Select, Text } from 'grommet'
import { IncidentStatus } from './types'

const normalize = (val) => val.replace('_', ' ')

function textColor(status) {
  switch (status) {
    case IncidentStatus.OPEN:
      return 'error'
    case IncidentStatus.IN_PROGRESS:
      return 'progress'
    case IncidentStatus.RESOLVED:
      return 'status-ok'
    default:
      return null
  }
}

function StatusOption({label, value}, {active}) {
  return (
    <Box direction='row' background={active ? 'active' : null} gap='xsmall' align='center' 
         pad={{vertical: 'xsmall', horizontal: 'small'}}>
      <Text size='small' weight={500} color={textColor(value)}>{label}</Text>
    </Box>
  )
}

const options = Object.keys(IncidentStatus).map((status) => ({value: status, label: normalize(status)}))

export function StatusSelector({status, setStatus}) {
  return (
    <Select 
      options={options}
      value={status}
      valueKey={{key: 'value', reduce: true}}
      labelKey='label'
      onChange={({value}) => setStatus(value)}>
      {StatusOption}
    </Select>
  )
}

export function Status({incident: {status}}) {
  return (
    <Box flex={false} round='xsmall'>
      <Text size='small' weight={500} color={textColor(status)}>{normalize(status)}</Text>
    </Box>
  )
}