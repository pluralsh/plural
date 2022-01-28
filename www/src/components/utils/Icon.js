import React, { useState, useRef } from 'react'
import { Box, Text } from 'grommet'
import { useHistory } from 'react-router'
import { Tooltip } from './Tooltip'

const SIDEBAR_ICON_HEIGHT = '35px'

export function Icon({icon, text, selected, path, onClick, size, align}) {
  const dropRef = useRef()
  let history = useHistory()
  const [hover, setHover] = useState(false)

  return (
    <>
    <Box
      flex={false}
      ref={dropRef}
      focusIndicator={false}
      align='center'
      justify='center'
      // margin={{horizontal: 'xsmall'}}
      round='xsmall'
      height={size || SIDEBAR_ICON_HEIGHT}
      width={size || SIDEBAR_ICON_HEIGHT}
      hoverIndicator='sidebarHover'
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onClick ? onClick() : history.push(path)}
      background={selected ? 'sidebarHover' : null}
      direction='row'>
      {icon}
    </Box>
    {hover  && (
      <Tooltip pad='small' round='xsmall' justify='center' background='sidebarHover' 
               target={dropRef} side='right' align={align || {left: 'right'}} margin='xsmall'>
        <Text size='small' weight={500}>{text}</Text>
      </Tooltip>
    )}
    </>
  )
}