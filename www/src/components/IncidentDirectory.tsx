import { Box } from 'grommet'

import { Incidents as IncidentsIcon, Responses as ResponsesIcon } from 'forge-core'

import { useParams } from 'react-router-dom'

import { SectionContent } from './Explore'
import { Incidents } from './incidents/Incidents'
import { Responses } from './incidents/Responses'

import { SubmenuItem, SubmenuPortal } from './navigation/Submenu'

export function IncidentDirectory() {
  const { group } = useParams()

  return (
    <Box
      fill
      direction="row"
    >
      <SubmenuPortal name="incidents">
        <SubmenuItem
          selected={group === 'all'}
          url="/incidents/all"
          label="My Incidents"
          icon={<IncidentsIcon size="small" />}
        />
        <SubmenuItem
          selected={group === 'responses'}
          url="/incidents/responses"
          label="Responses"
          icon={<ResponsesIcon size="small" />}
        />
      </SubmenuPortal>
      <Box fill>
        <SectionContent
          name="all"
          header="Incidents"
        >
          <Incidents />
        </SectionContent>
        <SectionContent
          name="responses"
          header="Incident Responses"
        >
          <Responses />
        </SectionContent>
      </Box>
    </Box>
  )
}
