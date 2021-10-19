import React, { useRef, useState } from 'react'
import { Box, Text } from 'grommet'
import { Tooltip } from '../utils/Tooltip'
import { IncidentStatus, IncidentView } from './types'
import { Folder, Check as Checkmark } from 'forge-core'
import { Chat } from 'grommet-icons'

export function ViewOption({icon, selected, view, setView, text, side, size, width}) {
  const ref = useRef()
  const [hover, setHover] = useState(false)
  const props = {size: size || '20px'}
  return (
    <>
    <Box ref={ref} flex={false} width={width || '40px'} align='center' justify='center' round='xsmall' hoverIndicator='light-3'
      onClick={() => setView(view)} pad='xsmall' focusIndicator={false}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {React.createElement(icon, selected === view ? {...props, color: 'brand'} : props)}
    </Box>
    {hover  && (
      <Tooltip pad={{horizontal: 'small', vertical: 'xsmall'}} round='xsmall' justify='center' 
               target={ref} side='right' align={side || {left: 'right'}}>
        <Text size='small' weight={500}>{text}</Text>
      </Tooltip>
    )}
    </>
  )
}

export function ViewSwitcher({incident, view, setView}) {
  return (
    <Box width='50px' gap='small' align='center' pad={{vertical: 'small'}} border={{side: 'right', color: 'light-5'}}>
      <ViewOption 
        icon={Chat} 
        selected={view} 
        view={IncidentView.MSGS}
        setView={setView}
        text='Messages' />
      <ViewOption 
        icon={Folder} 
        selected={view} 
        view={IncidentView.FILES}
        setView={setView}
        text='Files' />
      {incident.status === IncidentStatus.COMPLETE && (
        <ViewOption
          icon={Checkmark}
          selected={view}
          view={IncidentView.POST}
          setView={setView}
          text='Postmortem' />
      )}
    </Box>
  )
}