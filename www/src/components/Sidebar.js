import React, { useState, useRef } from 'react'
import { Box, Drop, Text } from 'grommet'
import { Home } from 'grommet-icons'
import { useHistory } from 'react-router-dom'

const SIDEBAR_ROW_HEIGHT = '50px'

export function SidebarIcon({icon, text, selected, path}) {
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
      focusIndicator={false}
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

export default function Sidebar() {
  let history = useHistory()

  return (
    <Box gap='small'>
      <SidebarIcon icon={Home} onClick={() => history.push("/")} />
    </Box>
  )
}