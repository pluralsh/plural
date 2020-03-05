import React, { useState, useRef } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { Deploy, Network, Configure, Dashboard } from 'grommet-icons'
import { Box, Text, Drop } from 'grommet'

const SIDEBAR_ROW_HEIGHT = '40px'

function SidebarIcon({icon, text, selected, path}) {
  const dropRef = useRef()
  let history = useHistory()
  const [hover, setHover] = useState(false)
  return (
    <>
    <Box
      ref={dropRef}
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
      {/* <Text size='small'>{text}</Text> */}
    </Box>
    {hover && (
      <Drop target={dropRef.current} plain align={{left: 'right'}}>
        <Box background='sidebarHover' pad='small' height='40px' align='center' justify='center'>
          <Text size='small'>{text}</Text>
        </Box>
      </Drop>
    )}
    </>
  )
}

const ICON_HEIGHT = '20px'

const OPTIONS = [
  {text: 'Builds', icon: <Deploy size={ICON_HEIGHT} />, path: '/'},
  {text: 'Configuration', icon: <Configure size={ICON_HEIGHT} />, path: '/config' },
  {text: 'Observability', icon: <Dashboard size={ICON_HEIGHT} />, path: '/dashboards'},
  {text: 'Webhooks', icon: <Network size={ICON_HEIGHT} />, path: '/webhooks'},
]

export default function Sidebar() {
  const loc = useLocation()
  const active = OPTIONS.findIndex(({path}) => path === loc.pathname)

  return (
    <Box background='sidebar' height='100vh'>
      <Box height='50px' justify='center' pad='small'>
        {/* <Text size='small' weight='bold'>Watchman</Text> */}
      </Box>
      {OPTIONS.map(({text, icon, path}, ind) => (
        <SidebarIcon key={ind} icon={icon} path={path} text={text} selected={ind === active} />
      ))}
    </Box>
  )
}