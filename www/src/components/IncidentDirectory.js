import React from 'react'
import { Box } from 'grommet'
import { SectionItemContainer, SectionContent } from './Explore'
import { Aid, Alert } from 'grommet-icons'
import { Incidents } from './incidents/Incidents'
import { Responses } from './incidents/Responses'
import { useParams } from 'react-router'

const ICON_SIZE = '14px'

function SectionItem({name, label, icon}) {
  const {group} = useParams()
  return (
    <SectionItemContainer
      label={label}
      selected={group === name}
      location={`/incidents/${name}`}
      icon={React.createElement(icon, {size: ICON_SIZE})} />
  )
}

export function IncidentDirectory() {
  return (
    <Box fill direction='row'>
      <Box flex={false} width='175px' background='backgroundColor' fill='vertical' pad={{vertical: 'medium', right: 'small'}} gap='xsmall'>
        <SectionItem name='all' label='Incidents' icon={Alert} />
        <SectionItem name='responses' label='Responses' icon={Aid} />
      </Box>
      <Box fill>
        <SectionContent name='all' header='Incidents'>
          <Incidents />
        </SectionContent>
        <SectionContent name='responses' header='Incident Responses'>
          <Responses />
        </SectionContent>
      </Box>
    </Box>
  )
}