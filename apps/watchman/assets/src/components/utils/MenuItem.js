import React from 'react'
import HoveredBackground from './HoveredBackground'
import {Box, Text} from 'grommet'
import {FormNext} from 'grommet-icons'

const ITEM_PADDING = {vertical: 'xsmall', left: 'small', right: 'xsmall'}

export function SubMenu(props) {
  const {text, setAlternate, children, ...rest} = props
  return (
    <MenuItem onClick={() => setAlternate(children)} direction='row' {...rest}>
      <Box width='100%'>
        <Text size='small'>{text}</Text>
      </Box>
      <Box width='20px' align='center' justify='center'>
        <FormNext size='15px' />
      </Box>
    </MenuItem>
  )
}


export function MenuItem(props) {
  const {onClick, children, ...rest} = props
  return (
    <Box pad={{horizontal: 'xxsmall'}}>
      <HoveredBackground>
        <Box
          hoverable
          round='xsmall'
          style={{cursor: 'pointer'}}
          pad={ITEM_PADDING}
          onClick={() => onClick && onClick()}
          {...rest}>
          {children}
        </Box>
      </HoveredBackground>
    </Box>
  )
}

export default MenuItem