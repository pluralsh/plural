import React, { useContext, useEffect, useRef, useState } from 'react'
import { Box, Drop, Select, Text } from 'grommet'
import { CurrentUserContext } from '../login/CurrentUser'
import { canEdit } from './Incident'
import { Down } from 'grommet-icons'

const severityOptions = [0, 1, 2, 3, 4, 5].map((sev) => ({value: sev, label: `SEV ${sev}`}))

const SeverityStatusOption = ({value}, {active}) => {
  const color = severityColor(value)

  return (
    <Box direction='row' background={active ? 'active' : null} gap='xsmall' align='center' 
         pad={{vertical: 'xsmall', horizontal: 'small'}}>
      <Box flex={false} background={color} round='xsmall' pad={{horizontal: 'xsmall', vertical: '1px'}}>
        <Text size='small' weight={500}>SEV {value}</Text> 
      </Box>
    </Box>
  )
}

export function SeverityNub({severity}) {
  const color = severityColor(severity)
  return (
    <Box flex={false} background={color} round='xsmall' pad={{horizontal: 'xsmall', vertical: '1px'}}>
      <Text size='small' weight={500}>SEV {severity}</Text> 
    </Box>
  )
}

function SeverityOption({value, active, setActive}) {
  const color = severityColor(value)

  return (
    <Box direction='row' background={active ? 'active' : null} gap='xsmall' align='center' hoverIndicator='light-2'
         pad={{vertical: 'xsmall', horizontal: 'small'}} onClick={() => setActive(value)}>
      <Box flex={false} background={color} round='xsmall' pad={{horizontal: 'xsmall', vertical: '1px'}}>
        <Text size='small' weight={500}>SEV {value}</Text> 
      </Box>
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
      {SeverityStatusOption}
    </Select>
  )
}

export function severityColor(severity) {
  if (severity < 2) return 'error'
  if (severity >= 2 && severity < 4) return 'status-warning'
  if (severity === 4) return 'light-4'
  return 'progress'
}

export function Severity({incident: {severity, ...incident}, setSeverity}) {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  const user = useContext(CurrentUserContext)
  const color = severityColor(severity)
  const editable = canEdit(incident, user) && setSeverity
  useEffect(() => setOpen(false), [severity])

  return (
    <>
    <Box ref={ref} flex={false} background={color} round='xsmall' align='center' direction='row' gap='xsmall'
         pad={{horizontal: 'xsmall', vertical: '1px'}} onClick={() => editable && setOpen(true)} focusIndicator={false}>
      <Text size='small' weight={500}>SEV {severity}</Text> 
      {editable && <Down size='small' />}
    </Box>
    {open && (
      <Drop target={ref.current} align={{top: 'bottom'}} onClickOutside={() => setOpen(false)}>
        <Box width='150px'>
          {severityOptions.map(({value, label}) => (
            <SeverityOption key={value} value={value} label={label} active={severity === value} setActive={setSeverity || (() => null)} />
          ))}
        </Box>
      </Drop>
    )}
    </>
  )
}