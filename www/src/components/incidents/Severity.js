import React from 'react'
import { Box, Select, Text } from 'grommet'

const severityOptions = [0, 1, 2, 3, 4, 5].map((sev) => ({value: sev, label: `SEV ${sev}`}))

function SeverityOption({value, label}, {active}) {
  return (
    <Box direction='row' background={active ? 'active' : null} gap='xsmall' align='center'>
      <Text size='small'>{label}</Text>
      <Severity severity={value} />
    </Box>
  )
}

export function SeveritySelect({severity, setSeverity}) {
  return (
    <Select 
      options={severityOptions}
      valueKey='value'
      labelKey='label'
      selected={severity}
      onChange={({selected: {value}}) => setSeverity(value)}
    >
      {SeverityOption}
    </Select>
  )
}

export function severityColor(severity) {
  if (severity <= 2) return 'error'
  if (severity > 2 && severity <= 4) return 'status-warning'
  return 'light-4'
}

export function Severity({severity}) {
  const color = severityColor(severity)
  return (
    <Box background={color} round='xsmall' align='center' direction='row'
         pad={{horizontal: 'xsmall', vertical: '1px'}}>
      <Text size='small' weight={500}>SEV {severity}</Text> 
    </Box>
  )
}