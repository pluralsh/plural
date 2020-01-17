import React, {useState, useRef} from 'react'
import {useHistory} from 'react-router-dom'
import {useMutation} from 'react-apollo'
import {Box, Text, Drop, Layer} from 'grommet'
import {Book, Logout, User} from 'grommet-icons'
import Avatar from './Avatar'
import HoveredBackground from '../utils/HoveredBackground'
import MenuItem from '../utils/MenuItem'
import {ModalHeader} from '../utils/Modal'
import {wipeToken} from '../../helpers/authentication'
import {FilePicker} from 'react-file-picker'
import {UPDATE_USER, ME_Q} from './queries'
import {TOOLBAR_SIZE} from '../Chartmart'
import CreatePublisher from '../publisher/CreatePublisher'
import {FaCreditCard} from 'react-icons/fa'

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

function CreatePublisherModal() {
  const [open, setOpen] = useState(false)
  let history = useHistory()
  return (
    <>
    <DropdownItem icon={Book} text="Create publisher" onClick={() => setOpen(true)} />
    {open && (
      <Layer
        modal
        position='center'
        onClickOutside={() => setOpen(false)}
        onEsc={() => setOpen(false)} >
        <Box width='30vw'>
          <ModalHeader text='Create Publisher' setOpen={setOpen} />
          <Box pad='medium'>
            <CreatePublisher onCreate={() => {
              setOpen(false)
              history.push('/publishers/mine')
            }}/>
          </Box>
        </Box>
      </Layer>
    )}
    </>
  )
}

function Me({me}) {
  const [open, setOpen] = useState(false)
  const dropRef = useRef()
  let history = useHistory()
  const [mutation] = useMutation(UPDATE_USER, {
    update: (cache, {data: updateUser}) => {
      const prev = cache.readQuery({ query: ME_Q })
      cache.writeQuery({query: ME_Q, data: {
        ...prev,
        me: {
          ...prev.me,
          ...updateUser
        }
      }})
    }
  })

  return (
    <>
    <HoveredBackground>
      <Box
        sidebarHover
        ref={dropRef}
        style={{cursor: 'pointer'}}
        pad={{horizontal: 'small'}}
        width='250px'
        height={TOOLBAR_SIZE}
        direction='row'
        align='center'
        gap='small'>
        <FilePicker
          extensions={['jpg', 'jpeg', 'png']}
          dims={{minWidth: 100, maxWidth: 500, minHeight: 100, maxHeight: 500}}
          onChange={(file) => mutation({variables: {attributes: {avatar: file}}})}
        >
          <span><Avatar size='40px' user={me} /></span>
        </FilePicker>
        <Box onClick={() => setOpen(true)} height={TOOLBAR_SIZE} justify='center'>
          <Text size='small' style={{fontWeight: 500}}>{me.name}</Text>
          {me.publisher && (<Text size='xsmall'>{me.publisher.name}</Text>)}
        </Box>
      </Box>
    </HoveredBackground>
    {open && (
      <Drop align={{top: 'bottom'}} target={dropRef.current} onClickOutside={() => setOpen(false)}>
        <Box gap='xxsmall' pad={{top: 'xxsmall'}}>
          {me.publisher ?
            <DropdownItem icon={Book} text="Edit publisher" onClick={() => history.push('/publishers/mine')} /> :
            <CreatePublisherModal />
          }
          <DropdownItem icon={User} text="Edit user" onClick={() => history.push('/me/edit')} />
          <DropdownItem icon={FaCreditCard} text="Billing Details" onClick={() => history.push('/me/billing')} />
          <Box border='top' pad={{vertical: 'xxsmall'}}>
            <MenuItem onClick={() => {
              wipeToken()
              window.location.href = "/login"
            }}>
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