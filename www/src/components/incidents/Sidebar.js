import React, { useCallback, useState } from 'react'
import { Box, Text } from 'grommet';
import { Hide, History } from 'grommet-icons';
import { IncidentHistory } from './IncidentHistory';
import { SidebarView } from './types';
import { ViewOption } from './ViewSwitcher';

const animation = {
  outline: 'none',
  transition: 'width 0.75s cubic-bezier(0.000, 0.795, 0.000, 1.000)'
};

function SmallSidebar({setOpen, setView}) {
  const doOpen = useCallback((view) => {
    setView(view)
    setOpen(true)
  }, [setOpen, setView])

  return (
    <Box fill gap='xsmall' align='center' pad={{top: 'small'}}>
      <ViewOption icon={History} view={SidebarView.HISTORY} setView={doOpen} side={{right: 'left'}} text='history' />
    </Box>
  )
}

function SidebarContent({view, setView, incident, fetchMore, setOpen}) {
  return (
    <Box fill>
      <Box flex={false} direction='row' justify='end' align='center' 
           gap='xsmall' pad='xsmall' border={{side: 'bottom', color: 'light-5'}}>
        <Box direction='row' fill='horizontal' align='center' pad={{horizontal: 'xsmall'}} gap='small'>
          <Box flex={false} width='25px' onClick={() => setOpen(false)} pad='xsmall' round='xsmall' hoverIndicator='light-2'
            align='center' justify='center'>
            <Hide size='15px' />
          </Box>
          <Text size='small' weight={500}>{view}</Text>
        </Box>
        <ViewOption 
          icon={History} 
          size='15px' 
          view={SidebarView.HISTORY} 
          selected={view} 
          setView={setView} 
          side={{top: 'bottom'}} 
          text='history' />
      </Box>
      <Box fill>
        {view === SidebarView.HISTORY && <IncidentHistory incident={incident} fetchMore={fetchMore} />}
      </Box>
    </Box>
  )
}

export function Sidebar({incident, fetchMore}) {
  const [open, setOpen] = useState(true)
  const [view, setView] = useState(SidebarView.HISTORY)

  return (
    <Box flex={false} style={animation} width={open ? '25%' : '50px'} border={{side: 'left', color: 'light-5'}}>
      {!open && <SmallSidebar open={open} setOpen={setOpen} setView={setView} />}
      {open && <SidebarContent view={view} setView={setView} setOpen={setOpen} incident={incident} fetchMore={fetchMore} />}
    </Box>
  )
}