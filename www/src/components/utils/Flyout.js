import React from 'react'
import { Box, Text } from 'grommet'
import { Next } from 'grommet-icons'
import { Portal } from 'react-portal'

const FLYOUT_ID = 'flyout-container'

export function Flyout({width, title, setOpen, children}) {
  return (
    <Portal node={document.getElementById(FLYOUT_ID)}>
      <Box width={width} flex={false} fill='vertical' background='white'>
        <Box flex={false} pad='small' direction='row' align='center' border={{side: 'bottom', color: 'light-5'}}>
          <Box fill='horizontal'>
            <Text size='small' weight={500}>{title}</Text>
          </Box>
          <Box flex={false} pad='xsmall' round='xsmall' onClick={() => setOpen(false)} hoverIndicator='light-3'>
            <Next size='small' />
          </Box>
        </Box>
        <Box fill background='white'>
          {children}
        </Box>
      </Box>
    </Portal>
  )
} 

export function FlyoutContainer() {
  return (
    <Box flex={false} id={FLYOUT_ID} />
  )
}