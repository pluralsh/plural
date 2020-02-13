import React, { useState } from 'react'
import { Deploy } from 'grommet-icons'
import { Box } from 'grommet'

const SIDEBAR_ROW_HEIGHT = '30px'

function SidebarIcon({icon}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      align='center'
      height={SIDEBAR_ROW_HEIGHT}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      border={hover ? {side: 'right', color: 'brand', size: '3px'} : null}
      direction='row'>
      {icon}
    </Box>
  )
}

export default function Sidebar() {
  return (
    <Box>
      <SidebarIcon icon={<Deploy size='15px' />} />
    </Box>
  )
}