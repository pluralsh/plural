import React, { useState } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { Deploy } from 'grommet-icons'
import { Box, Text } from 'grommet'

const SIDEBAR_ROW_HEIGHT = '40px'

function SidebarIcon({icon, text, selected, path}) {
  let history = useHistory()
  const [hover, setHover] = useState(false)
  return (
    <Box
      align='center'
      pad='small'
      gap='small'
      height={SIDEBAR_ROW_HEIGHT}
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => history.push(path)}
      background={(hover || selected) ? 'sidebarHover' : null}
      border={selected ? {side: 'left', color: 'focus', size: '3px'} : null}
      direction='row'>
      {icon}
      <Text size='small'>{text}</Text>
    </Box>
  )
}

const OPTIONS = [
  {text: 'Builds', icon: <Deploy size='15px' />, path: '/'}
]

export default function Sidebar() {
  const loc = useLocation()
  const active = Math.max(OPTIONS.findIndex(({path}) => path === loc.pathname), 0)

  return (
    <Box background='sidebar' height='100vh'>
      <Box height='50px' justify='center' pad='small'>
        <Text size='small' weight='bold'>Watchman</Text>
      </Box>
      {OPTIONS.map(({text, icon, path}, ind) => (
        <SidebarIcon key={ind} icon={icon} path={path} text={text} selected={ind === active} />
      ))}
    </Box>
  )
}