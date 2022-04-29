import { useRef, useState } from 'react'
import { Box, Text } from 'grommet'
import { useNavigate } from 'react-router-dom'

import { Tooltip } from './Tooltip'

const SIDEBAR_ICON_HEIGHT = '35px'

export function Icon({ icon, text, selected, path, onClick, size, align }) {
  const dropRef = useRef()
  const navigate = useNavigate()
  const [hover, setHover] = useState(false)

  return (
    <>
      <Box
        flex={false}
        ref={dropRef}
        focusIndicator={false}
        align="center"
        justify="center"
      // margin={{horizontal: 'xsmall'}}
        round="xsmall"
        height={size || SIDEBAR_ICON_HEIGHT}
        width={size || SIDEBAR_ICON_HEIGHT}
        hoverIndicator="sidebarHover"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => onClick ? onClick() : navigate(path)}
        background={selected ? 'sidebarHover' : null}
        direction="row"
      >
        {icon}
      </Box>
      {hover && (
        <Tooltip
          pad="small"
          justify="center"
          background="sidebarHover"
          target={dropRef}
          side="right"
          align={align || { left: 'right' }}
          margin="xsmall"
        >
          <Text
            size="small"
            weight={500}
          >
            {text}
          </Text>
        </Tooltip>
      )}
    </>
  )
}
