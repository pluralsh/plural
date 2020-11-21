import React, { useState, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useMutation } from 'react-apollo'
import { Box, Text, Layer } from 'grommet'
import { HoveredBackground, MenuItem, ModalHeader } from 'forge-core'
import Avatar from './Avatar'
import { FilePicker } from 'react-file-picker'
import { UPDATE_USER, ME_Q } from './queries'
import { TOOLBAR_SIZE } from '../Forge'
import CreatePublisher from '../publisher/CreatePublisher'

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

function CreatePublisherModal({setModal}) {
  let history = useHistory()
  return (
    <Layer
      modal
      position='center'
      onClickOutside={() => setModal(null)}
      onEsc={() => setModal(null)} >
      <Box width='30vw'>
        <ModalHeader text='Create Publisher' setOpen={setModal} />
        <Box pad='medium'>
          <CreatePublisher onCreate={() => {
            setModal(null)
            history.push('/publishers/mine')
          }}/>
        </Box>
      </Box>
    </Layer>
  )
}

export default function Me({me}) {
  const [modal, setModal] = useState(null)
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
  const onClick = useCallback(() => {
    if (!me.publisher) {
      setModal(<CreatePublisherModal setModal={setModal} />)
    } else {
      history.push('/publishers/mine')
    }
  }, [me.publisher, history, setModal])

  return (
    <>
    <HoveredBackground>
      <Box
        sidebarHover
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
        <Box style={{outline: 'none'}} onClick={onClick} focusIndicator={false}
             height={TOOLBAR_SIZE} justify='center'>
          <Text size='small' weight={500}>{me.name}</Text>
          {me.publisher && (<Text size='xsmall'>{me.publisher.name}</Text>)}
        </Box>
      </Box>
    </HoveredBackground>
    {modal}
    </>
  )
}