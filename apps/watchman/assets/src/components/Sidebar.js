import React, { useState, useRef } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import { Deploy, Network, Configure, BarChart } from 'grommet-icons'
import { Box, Text, Drop } from 'grommet'

const SIDEBAR_ROW_HEIGHT = '50px'
const APP_ICON = `${process.env.PUBLIC_URL}/watchman.png`

function SidebarIcon({icon, text, selected, path}) {
  const dropRef = useRef()
  let history = useHistory()
  const [hover, setHover] = useState(false)
  return (
    <>
    <Box
      ref={dropRef}
      align='center'
      justify='center'
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
    </Box>
    {hover && (
      <Drop target={dropRef.current} plain align={{left: 'right'}}>
        <Box background='sidebarHover' pad='small' height={SIDEBAR_ROW_HEIGHT} align='center' justify='center'>
          <Text size='small' style={{fontWeight: 500}}>{text}</Text>
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
  {text: 'Observability', icon: <BarChart size={ICON_HEIGHT} />, path: '/dashboards'},
  {text: 'Webhooks', icon: <Network size={ICON_HEIGHT} />, path: '/webhooks'},
]

export default function Sidebar() {
  const loc = useLocation()
  const active = OPTIONS.findIndex(({path}) => path === loc.pathname)

  return (
    <Box background='sidebar' height='100vh'>
      <Box height='50px' justify='center' align='center' pad='small' margin={{bottom: 'medium'}}>
        <img height='30px' width='30px' alt='' src={APP_ICON} />
      </Box>
      {OPTIONS.map(({text, icon, path}, ind) => (
        <SidebarIcon key={ind} icon={icon} path={path} text={text} selected={ind === active} />
      ))}
    </Box>
  )
}