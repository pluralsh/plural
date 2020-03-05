import React, {useState} from 'react'
import {Box} from 'grommet'
import {Home} from 'grommet-icons'
import {useHistory} from 'react-router-dom'
import HoveredBackground from './utils/HoveredBackground'

const SIDEBAR_HEIGHT = '40px'
const ICON_HEIGHT = '20px'

function SidebarIcon(props) {
  const [hover, setHover] = useState(false)
  return (
    <HoveredBackground>
      <Box
        sidebarHover
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{cursor: 'pointer', borderLeft: (hover ? '2px solid white' : null)}}
        align='center'
        justify='center'
        height={SIDEBAR_HEIGHT}
        onClick={props.onClick}>
        {React.createElement(props.icon, {size: ICON_HEIGHT})}
      </Box>
    </HoveredBackground>
  )
}

function Sidebar() {
  let history = useHistory()

  return (
    <Box gap='small'>
      <SidebarIcon icon={Home} onClick={() => history.push("/")} />
    </Box>
  )
}

export default Sidebar