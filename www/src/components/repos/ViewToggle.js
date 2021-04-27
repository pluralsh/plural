import React, { useRef, useState } from 'react'
import { Script, Package, Deploy } from 'grommet-icons'
import { Box, Drop, Text } from 'grommet'
import styled from 'styled-components'
import { normalizeColor } from 'grommet/utils'

export const RepoView = {
  RECIPE: 'r',
  PKG: 'p',
  DEPLOY: 'd'
}

const ICON_SIZE = '15px'

const ViewIcon = {
  r: <Script size={ICON_SIZE} />,
  p: <Package size={ICON_SIZE} />,
  d: <Deploy size={ICON_SIZE} />
}

const names = {
  r: 'recipes',
  p: 'packages',
  d: 'deployments'
}

const toggleHover = styled.div`
&:hover span {
  color: ${props => normalizeColor('brand', props.theme)};
}
&:hover svg {
  stroke: ${props => normalizeColor('brand', props.theme)} !important;
  fill: ${props => normalizeColor('brand', props.theme)} !important;
}
`

export function ViewToggle({view, setView}) {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  return (
    <>
    <Box flex={false} ref={ref} as={toggleHover} direction='row' gap='xsmall' align='center' onClick={() => setOpen(true)}>
      {ViewIcon[view]}
      <Text size='small'>{names[view]}</Text>
    </Box>
    {open && (
      <Drop target={ref.current} align={{top: 'bottom'}} onClickOutside={() => setOpen(false)}>
        <Box flex={false} pad='xsmall' gap='xsmall'>
          {Object.values(RepoView).map((v) => (
            <Box direction='row' pad='xsmall' align='center' gap='xsmall' hoverIndicator='light-2' 
                 round='xsmall' onClick={() => setView(v)} focusIndicator={false}>
              {ViewIcon[v]}
              <Text size='small'>{names[v]}</Text>
            </Box>
          ))}
        </Box>
      </Drop>
    )}
    </>
  )
}