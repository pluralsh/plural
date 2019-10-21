import React, {useState, useRef} from 'react'
import {useHistory} from 'react-router-dom'
import {Box, Text, Drop} from 'grommet'
import {Book, Logout} from 'grommet-icons'
import Avatar from './Avatar'
import HoveredBackground from '../utils/HoveredBackground'
import MenuItem from '../utils/MenuItem'

export function DropdownItem(props) {
  const {onClick, ...rest} = props
  return (
    <MenuItem onClick={() => onClick && onClick()} {...rest}>
      <Box direction='row' align='center' gap='xsmall'>
        {props.icon && React.createElement(props.icon, {size: '12px'})}
        <Text size='small'>{props.text}</Text>
      </Box>
    </MenuItem>
  )
}
function Me({me}) {
  const [open, setOpen] = useState(false)
  const dropRef = useRef()
  let history = useHistory()

  return (
    <>
    <HoveredBackground>
      <Box
        sidebarHover
        ref={dropRef}
        onClick={() => setOpen(true)}
        style={{cursor: 'pointer'}}
        pad={{horizontal: 'small'}}
        width='250px'
        direction='row'
        align='center'
        gap='xsmall'>
        <Avatar size='40px' user={me} />
        <Text size='small'>{me.name}</Text>
      </Box>
    </HoveredBackground>
    {open && (
      <Drop align={{top: 'bottom'}} target={dropRef.current} onClickOutside={() => setOpen(false)}>
        <Box gap='xxsmall' pad={{top: 'xxsmall'}}>
          <DropdownItem icon={Book} text="Edit publisher" onClick={() => history.push('/publishers/mine')} />
          <Box border='top' pad={{vertical: 'xxsmall'}}>
            <MenuItem onClick={() => console.log('logout')}>
              <Box direction='row' align='center'>
                <Box width='100%'>
                  <Text size='small'>logout</Text>
                </Box>
                <Logout size='12px' />
              </Box>
            </MenuItem>
          </Box>
        </Box>
      </Drop>
    )}
    </>
  )
}

export default Me