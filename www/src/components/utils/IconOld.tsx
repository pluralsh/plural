import { createElement, useRef, useState } from 'react'
import { Box, Text } from 'grommet'
import { TooltipContent } from 'forge-core'

export function Icon({
  icon, iconAttrs, tooltip, onClick, hover,
}: any) {
  const dropRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  return (
    <>
      <Box
        ref={dropRef}
        pad="small"
        round="xsmall"
        onClick={onClick}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        hoverIndicator={hover || 'fill-two'}
        focusIndicator={false}
      >
        {createElement(icon, { size: 16, ...(iconAttrs || {}) })}
      </Box>
      {open && tooltip && (
        <TooltipContent
          pad="xsmall"
          round="xsmall"
          justify="center"
          targetRef={dropRef}
          side="top"
          align={{ bottom: 'top' }}
        >
          <Text
            size="small"
            weight={500}
          >
            {tooltip}
          </Text>
        </TooltipContent>
      )}
    </>
  )
}
