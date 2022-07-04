import { createElement, memo, useRef, useState } from 'react'
import { Box, Layer, Text, TextInput } from 'grommet'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { AddUser, Button, EditField as Edit, GqlError, Group, Public, TooltipContent, Trash } from 'forge-core'
import Toggle from 'react-toggle'

import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { FixedScroller } from '../utils/SmoothScroller'
import Avatar from '../users/Avatar'
import { ModalHeader } from '../ModalHeader'

import { CREATE_GROUP_MEMBERS, DELETE_GROUP, DELETE_GROUP_MEMBER, GROUP_MEMBERS, UPDATE_GROUP } from './queries'
import { fetchUsers } from './Typeaheads'
import { SearchIcon, addGroupMember, deleteGroup } from './utils'

const GroupMemberRow = memo(({ group, user }) => {
  const [mutation] = useMutation(DELETE_GROUP_MEMBER, {
    variables: { groupId: group.id, userId: user.id },
    update: (cache, { data: { deleteGroupMember } }) => updateCache(cache, {
      query: GROUP_MEMBERS,
      variables: { id: group.id },
      update: prev => removeConnection(prev, deleteGroupMember, 'groupMembers'),
    }),
  })

  return (
    <Box
      flex={false}
      fill="horizontal"
      direction="row"
      gap="small"
      border={{ side: 'bottom', color: 'border' }}
      align="center"
      pad={{ horizontal: 'small' }}
      height="75px"
    >
      <Box
        fill="horizontal"
        direction="row"
        align="center"
        gap="small"
      >
        <Avatar
          user={user}
          size="50px"
        />
        <Box justify="center">
          <Text
            size="small"
            weight="bold"
          >{user.email}
          </Text>
          <Text size="small">{user.name}</Text>
        </Box>
      </Box>
      <Box flex={false}>
        <Icon
          icon={Trash}
          tooltip="delete"
          onClick={mutation}
          iconAttrs={{ color: 'error' }}
        />
      </Box>
    </Box>
  )
})

function Placeholder() {
  return (
    <Box
      height="75px"
      direction="row"
      pad="small"
    >
      <Box
        height="50px"
        width="50px"
        background="tone-light"
      />
      <Box
        fill="horizontal"
        gap="xsmall"
      >
        <Box
          width="200px"
          height="13px"
          background="tone-light"
        />
        <Box
          width="400px"
          height="13px"
          background="tone-light"
        />
      </Box>
    </Box>
  )
}

function GroupMembers({ group }) {
  const { data, loading, fetchMore } = useQuery(GROUP_MEMBERS, {
    variables: { id: group.id },
    fetchPolicy: 'cache-and-network',
  })

  if (!data) return <LoopingLogo />
  const { groupMembers: { pageInfo, edges } } = data

  return (
    <Box
      fill
      border={{ side: 'top', color: 'border' }}
      margin={{ top: 'small' }}
    >
      <FixedScroller
        items={edges}
        loading={loading}
        itemSize={75}
        placeholder={Placeholder}
        hasNextPage={pageInfo.hasNextPage}
        mapper={({ node }) => (
          <GroupMemberRow
            key={node.user.id}
            user={node.user}
            group={group}
          />
        )}
        loadNextPage={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { groupMembers } }) => extendConnection(prev, groupMembers, 'groupMembers'),
        })}
      />
    </Box>
  )
}

export function Icon({ icon, iconAttrs, tooltip, onClick, hover }) {
  const dropRef = useRef()
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
        {createElement(icon, { size: '14px', ...(iconAttrs || {}) })}
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

function MemberAdd({ group, setModal }) {
  const client = useApolloClient()
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [mutation, { error }] = useMutation(CREATE_GROUP_MEMBERS, {
    variables: { groupId: group.id },
    update: (cache, { data: { createGroupMember } }) => {
      try {
        addGroupMember(cache, group, createGroupMember)
      }
      catch (error) {
        // igonre
      }
    },
    onCompleted: () => setModal(null),
  })

  return (
    <Box
      gap="small"
      pad="medium"
    >
      {error && (
        <GqlError
          error={error}
          header="Could not add group member"
        />
      )}
      <TextInput
        icon={<SearchIcon />}
        placeholder="search for a user"
        value={q}
        suggestions={suggestions}
        onSelect={({ suggestion: { value } }) => {
          setQ(value.name)
          mutation({ variables: { userId: value.id } })
        }}
        onChange={({ target: { value } }) => {
          setQ(value)
          fetchUsers(client, value, setSuggestions)
        }}
      />
    </Box>
  )
}

function GroupName({ group: { name, description, global } }) {
  return (
    <Box
      fill="horizontal"
      gap="xsmall"
      direction="row"
      align="center"
    >
      <Text
        size="small"
        weight={500}
      >{name}
      </Text>
      {global && <Public size="small" />}
      <Text size="small">--</Text>
      <Text size="small"><i>{description || 'no description'}</i></Text>
    </Box>
  )
}

function GroupEdit({ group, setEdit }) {
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description)
  const [global, setGlobal] = useState(group.global)
  const [mutation, { loading }] = useMutation(UPDATE_GROUP, {
    variables: { id: group.id, attributes: { name, description, global } },
    onCompleted: () => setEdit(false),
  })

  return (
    <Box
      fill="horizontal"
      gap="small"
      direction="row"
      align="center"
    >
      <Box
        width="70%"
        direction="row"
        align="center"
        gap="xsmall"
      >
        <TextInput
          name="name"
          value={name}
          onChange={({ target: { value } }) => setName(value)}
        />
        <Box flex={false}>
          <Text size="small">--</Text>
        </Box>
        <TextInput
          name="description"
          value={description || ''}
          placeholder="enter a description"
          onChange={({ target: { value } }) => setDescription(value)}
        />
      </Box>
      <Box
        direction="row"
        align="center"
        gap="xsmall"
      >
        <Toggle
          checked={global}
          onChange={({ target: { checked } }) => setGlobal(checked)}
        />
        <Text size="small">global</Text>
      </Box>
      <Button
        label="update"
        loading={loading}
        onClick={mutation}
      />
    </Box>
  )
}

export default function GroupRow({ group }) {
  const ref = useRef()
  const [modal, setModal] = useState(null)
  const [edit, setEdit] = useState(false)
  const [mutation] = useMutation(DELETE_GROUP, {
    variables: { id: group.id },
    update: (cache, { data }) => deleteGroup(cache, data.deleteGroup),
  })

  return (
    <Box
      ref={ref}
      border={{ side: 'bottom', color: 'border' }}
    >
      <Box
        direction="row"
        pad="small"
        align="center"
      >
        {edit ? (
          <GroupEdit
            group={group}
            setEdit={setEdit}
          />
        ) : <GroupName group={group} />}
        <Box
          flex={false}
          direction="row"
        >
          <Icon
            icon={Edit}
            tooltip="edit"
            onClick={() => setEdit(!edit)}
          />
          <Icon
            icon={AddUser}
            tooltip="add user"
            onClick={() => setModal({
              text: `Add user to ${group.name}`,
              body: <MemberAdd
                group={group}
                setModal={setModal}
              />,
            })}
          />
          <Icon
            icon={Group}
            tooltip="members"
            onClick={() => setModal({
              text: `${group.name} members`,
              body: <GroupMembers group={group} />,
              width: '50vw',
              height: '60vh',
            })}
          />
          <Icon
            icon={Trash}
            tooltip="delete"
            onClick={mutation}
            iconAttrs={{ color: 'error' }}
          />
        </Box>
      </Box>
      {modal && (
        <Layer
          modal
          position="center"
          onClickOutside={() => setModal(null)}
          onEsc={() => setModal(null)}
        >
          <Box
            width={modal.width || '30vw'}
            height={modal.height}
          >
            <ModalHeader
              text={modal.text}
              setOpen={setModal}
            />
            {modal.body}
          </Box>
        </Layer>
      )}
    </Box>
  )
}
