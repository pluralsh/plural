import React from 'react'
import { Box, Select, Text } from 'grommet'

const severityOptions = [0, 1, 2, 3, 4, 5].map((sev) => ({value: sev, label: `SEV ${sev}`}))

function SeverityOption({value, label}, {active}) {
  return (
    <Box direction='row' background={active ? 'active' : null} gap='xsmall' align='center' pad={{vertical: 'xsmall', horizontal: 'small'}}>
      <Box fill='horizontal'>
        <Text size='small'>{label}</Text>
      </Box>
      <Severity severity={value} />
    </Box>
  )
}

export function SeveritySelect({severity, setSeverity}) {
  return (
    <Select 
      multiple={false}
      options={severityOptions}
      valueKey={{key: 'value', reduce: true}}
      labelKey='label'
      value={severity}
      onChange={({value}) => setSeverity(value)}
    >
      {SeverityOption}
    </Select>
  )
}

export function severityColor(severity) {
  if (severity < 2) return 'error'
  if (severity >= 2 && severity < 4) return 'status-warning'
  if (severity === 4) return 'light-4'
  return 'progress'
}

export function Severity({severity}) {
  const color = severityColor(severity)
  return (
    <Box flex={false} background={color} round='xsmall' align='center' direction='row'
         pad={{horizontal: 'xsmall', vertical: '1px'}}>
      <Text size='small' weight={500}>SEV {severity}</Text> 
    </Box>
  )
}