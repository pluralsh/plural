import React, { useRef, useState } from 'react'
import { Button } from 'forge-core'
import { Script, Package, Deploy } from 'grommet-icons'
import { Box, Drop, Text } from 'grommet'

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

export function ViewToggle({view, setView}) {
  const ref = useRef()
  const [open, setOpen] = useState(false)
  return (
    <>
    <Box ref={ref} flex={false}>
      <Button background='brand' label={names[view]} icon={ViewIcon[view]} onClick={() => setOpen(true)} />
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