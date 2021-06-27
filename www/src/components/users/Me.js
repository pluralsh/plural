import React, { useState, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Text, Layer, Drop } from 'grommet'
import { MenuItem, ModalHeader } from 'forge-core'
import { TOOLBAR_SIZE } from '../Plural'
import CreatePublisher from '../publisher/CreatePublisher'
import { useQuery } from 'react-apollo'
import { ACCOUNT_PUBLISHERS } from '../publisher/queries'
import Avatar from './Avatar'
import { Add, Edit, Logout, User } from 'grommet-icons'
import { wipeToken } from '../../helpers/authentication'

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

export function Item({onClick, icon, text, round}) {
  return (
    <Box pad={{horizontal: 'small', vertical: 'xsmall'}} hoverIndicator='light-2' round={round}
         focusIndicator={false} direction='row' gap='xsmall' onClick={onClick} align='center'>
      {icon}
      <Text size='small'>{text}</Text>
    </Box>
  )
}

function CreatePublisherModal({setModal}) {
  let history = useHistory()
  return (
    <Layer modal position='center' onClickOutside={() => setModal(null)} onEsc={() => setModal(null)} >
      <Box width='30vw'>
        <ModalHeader text='Create Publisher' setOpen={setModal} />
        <Box pad='small'>
          <CreatePublisher onCreate={() => {
            setModal(null)
            history.push('/publishers/mine')
          }}/>
        </Box>
      </Box>
    </Layer>
  )
}

function Publishers({account: {id: accountId}, publisher: {id}}) {
  let history = useHistory()
  const {data} = useQuery(ACCOUNT_PUBLISHERS, {variables: {accountId}})

  if (!data) return null
  const {edges} = data.publishers

  return (
    <Box fill='horizontal' gap='xsmall'>
      {edges.map(({node}) => (
        <Box key={node.id} pad={{horizontal: 'small', vertical: 'xsmall'}} direction='row'
             align='center' gap='small' hoverIndicator='light-2' focusIndicator={false}
             onClick={() => history.push(node.id === id ? '/publishers/mine/repos' : `/publisher/${id}`)}>
          <Avatar user={node} size='35px' />
          <Box>
            <Text size='small' weight={500}>{node.name}</Text>
            <Text size='small'><i>{node.description}</i></Text>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default function Me({me}) {
  let history = useHistory()
  const ref = useRef()
  const [modal, setModal] = useState(null)
  const [open, setOpen] = useState(false)
  const {account} = me

  return (
    <>
    <Box flex={false} ref={ref} height={TOOLBAR_SIZE} direction='row'
         gap='small' onClick={() => setOpen(true)} focusIndicator={false} align='center'
         justify='center' hoverIndicator='sidebarHover' pad={{right: 'medium', left: 'small'}}>
      <Avatar user={account} size='40px' />
      <Box>
        <Text size='small' weight={500}>{account && account.name}</Text>
        <Text size='xsmall'>{me.name}</Text>
      </Box>
    </Box>
    {open && (
      <Drop target={ref.current} align={{top: "bottom"}} onClickOutside={() => setOpen(false)}>
        <Box width='300px' gap='xsmall' pad='xsmall'>
          <Item
            icon={<Edit size='small' />}
            text='Update Account' round='xsmall'
            onClick={() => history.push('/accounts/edit/attributes')} />
          <Item
            icon={<User size='small' />}
            text='Edit user' round='xsmall'
            onClick={() => history.push('/me/edit/user')} />
          <Item
            icon={<Logout size='small' />}
            text='Logout' round='xsmall'
            onClick={() => {
              wipeToken()
              window.location = '/login'
            }} />
          {me.publisher && <Publishers account={account} publisher={me.publisher} />}
          {!me.publisher && (
            <Item
              icon={<Add size='small' />}
              text='Create new publisher' round='xsmall'
              onClick={() => setModal(<CreatePublisherModal setModal={setModal} />)} />
          )}
        </Box>
      </Drop>
    )}
    {modal}
    </>
  )
}