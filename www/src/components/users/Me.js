import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Drop, Layer, Text } from 'grommet'
import { CreatePublisher as CreatePublisherIcon, EditField, Logout, MenuItem, ModalHeader, User } from 'forge-core'

import { useQuery } from '@apollo/client'

import CreatePublisher from '../publisher/CreatePublisher'
import { ACCOUNT_PUBLISHERS } from '../publisher/queries'

import { wipeToken } from '../../helpers/authentication'

import Avatar from './Avatar'

export function DropdownItem(props) {
  const { onClick, ...rest } = props

  return (
    <MenuItem
      onClick={() => onClick && onClick()}
      {...rest}
    >
      <Box
        direction="row"
        align="center"
        gap="xsmall"
      >
        {props.icon && React.createElement(props.icon, { size: '12px' })}
        <Text size="small">{props.text}</Text>
      </Box>
    </MenuItem>
  )
}

export function Item({ onClick, icon, text, round }) {
  return (
    <Box
      pad={{ horizontal: 'small', vertical: 'xsmall' }}
      hoverIndicator="light-2"
      round={round}
      focusIndicator={false}
      direction="row"
      gap="xsmall"
      onClick={onClick}
      align="center"
    >
      {icon}
      <Text size="small">{text}</Text>
    </Box>
  )
}

function CreatePublisherModal({ setModal }) {
  const navigate = useNavigate()

  return (
    <Layer
      modal
      position="center"
      onClickOutside={() => setModal(null)}
      onEsc={() => setModal(null)}
    >
      <Box width="30vw">
        <ModalHeader
          text="Create Publisher"
          setOpen={setModal}
        />
        <Box pad="small">
          <CreatePublisher onCreate={() => {
            setModal(null)
            navigate('/publishers/mine')
          }}
          />
        </Box>
      </Box>
    </Layer>
  )
}

function Publishers({ publisher }) {
  const navigate = useNavigate()
  const { data } = useQuery(ACCOUNT_PUBLISHERS)

  if (!data) return null
  const { edges } = data.publishers
  const id = publisher && publisher.id

  return (
    <Box
      fill="horizontal"
      gap="xsmall"
    >
      {edges.map(({ node }) => (
        <Box
          key={node.id}
          pad={{ horizontal: 'small', vertical: 'xsmall' }}
          direction="row"
          align="center"
          gap="small"
          hoverIndicator="light-2"
          focusIndicator={false}
          onClick={() => navigate(node.id === id ? '/publishers/mine/repos' : `/publishers/${node.id}/repos`)}
        >
          <Avatar
            user={node}
            size="35px"
          />
          <Box>
            <Text
              size="small"
              weight={500}
            >{node.name}
            </Text>
            <Text size="small"><i>{node.description}</i></Text>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default function Me({ me }) {
  const navigate = useNavigate()
  const ref = useRef()
  const [modal, setModal] = useState(null)
  const [open, setOpen] = useState(false)
  const { account } = me

  return (
    <>
      <Box
        flex={false}
        ref={ref}
        direction="row"
        gap="small"
        focusIndicator={false}
        align="center"
        onClick={() => setOpen(true)}
        justify="center"
        hoverIndicator="sidebarHover"
        pad={{ right: 'medium', left: 'small' }}
        round="xsmall"
        height="40px"
      >
        <Avatar
          user={account}
          size="30px"
        />
        <Box flex={false}>
          <Text
            size="small"
            weight={500}
          >{account && account.name}
          </Text>
        </Box>
      </Box>
      {open && (
        <Drop
          target={ref.current}
          align={{ top: 'bottom' }}
          onClickOutside={() => setOpen(false)}
        >
          <Box
            width="300px"
            gap="xsmall"
            pad="xsmall"
          >
            <Item
              icon={<EditField size="small" />}
              text="Update Account"
              round="xsmall"
              onClick={() => navigate('/accounts/edit/attributes')}
            />
            <Item
              icon={<User size="small" />}
              text="Edit user"
              round="xsmall"
              onClick={() => navigate('/me/edit/user')}
            />
            <Item
              icon={<Logout size="small" />}
              text="Logout"
              round="xsmall"
              onClick={() => {
                wipeToken()
                window.location = '/login'
              }}
            />
            <Publishers
              account={account}
              publisher={me.publisher}
            />
            {!me.publisher && (
              <Item
                icon={<CreatePublisherIcon size="small" />}
                text="Create new publisher"
                round="xsmall"
                onClick={() => setModal(<CreatePublisherModal setModal={setModal} />)}
              />
            )}
          </Box>
        </Drop>
      )}
      {modal}
    </>
  )
}
