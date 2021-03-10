import React, { useContext, useEffect, useRef, useState } from 'react'
import { Box, Drop, Select, Text } from 'grommet'
import { IncidentStatus } from './types'
import { CurrentUserContext } from '../login/CurrentUser'
import { canEdit } from './Incident'
import { Down } from 'grommet-icons'

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

const StatusSelectOption = ({label, value}, {active}) => (
  <Box direction='row' background={active ? 'active' : null} gap='xsmall' align='center'
        pad={{vertical: 'xsmall', horizontal: 'small'}}>
    <Text size='small' weight={500} color={textColor(value)}>{label}</Text>
  </Box>
)

function StatusOption({label, value, active, setActive}) {
  return (
    <Box direction='row' background={active ? 'active' : null} gap='xsmall' align='center'  hoverIndicator='light-2'
         pad={{vertical: 'xsmall', horizontal: 'small'}} onClick={() => setActive(value)}>
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
      {StatusSelectOption}
    </Select>
  )
}

export function Status({incident: {status, ...incident}, setActive}) {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  const user = useContext(CurrentUserContext)
  const editable = canEdit(incident, user) && setActive
  useEffect(() => setOpen(false), [status])

  return (
    <>
    <Box ref={ref} flex={false} round='xsmall' direction='row' gap='xsmall' align='center'
      focusIndicator={false} onClick={() => editable && setOpen(true)}>
      <Text size='small' weight={500} color={textColor(status)}>{normalize(status)}</Text>
      {editable && <Down size='small' />}
    </Box>
    {open && (
      <Drop target={ref.current} onClickOutside={() => setOpen(false)} align={{top: 'bottom'}}>
        <Box width='150px'>
          {options.map(({value, label}) => (
            <StatusOption key={value} value={value} label={label} active={status === value} setActive={setActive} />
          ))}
        </Box>
      </Drop>
    )}
    </>
  )
}