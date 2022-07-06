import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { Box, TextInput } from 'grommet'
import { Div, Flex } from 'honorable'
import { Button, FormField, Modal, ModalActions, ModalHeader, PersonIcon, Switch, Tab, ValidatedInput } from 'pluralsh-design-system'
import { useState } from 'react'

import { appendConnection, extendConnection, removeConnection, updateCache } from '../../utils/graphql'
import { Placeholder } from '../accounts/Audits'
import { CREATE_GROUP, CREATE_GROUP_MEMBERS, DELETE_GROUP_MEMBER, GROUPS_Q, GROUP_MEMBERS, UPDATE_GROUP } from '../accounts/queries'
import { DeleteIcon } from '../profile/Icon'
import { ListItem } from '../profile/ListItem'
import { GqlError } from '../utils/Alert'
import { StandardScroller } from '../utils/SmoothScroller'

import { Actions } from './Actions'

import { fetchUsers } from './Typeaheads'

import { UserInfo } from './User'

function GroupMember({ user, group, first, last, edit }) {
  const [mutation] = useMutation(DELETE_GROUP_MEMBER, {
    variables: { groupId: group.id, userId: user.id },
    update: (cache, { data: { deleteGroupMember } }) => updateCache(cache, {
      query: GROUP_MEMBERS,
      variables: { id: group.id },
      update: prev => removeConnection(prev, deleteGroupMember, 'groupMembers'),
    }),
  })

  return (
    <ListItem
      flex={false}
      background="fill-two"
      first={first}
      last={last}
    >
      <Box
        flex={false}
        fill="horizontal"
        direction="row"
        align="center"
      >
        <UserInfo
          user={user}
          fill="horizontal"
        />
        {edit && (
          <DeleteIcon
            onClick={mutation}
            size={25}
          />
        )}
      </Box>
    </ListItem>
  )
}

function GroupMembers({ group, edit }) {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(GROUP_MEMBERS, {
    variables: { id: group.id },
    fetchPolicy: 'cache-and-network',
  })

  if (!data) return null
  const { groupMembers: { pageInfo, edges } } = data
  console.log(data)

  return (
    <Box
      flex={false}
      fill
    >
      <StandardScroller
        listRef={listRef}
        setListRef={setListRef}
        items={edges}
        loading={loading}
        placeholder={Placeholder}
        hasNextPage={pageInfo.hasNextPage}
        mapper={({ node }, { prev, next }) => (
          <GroupMember
            key={node.user.id}
            user={node.user}
            group={group}
            first={!prev.node}
            last={!next.node}
            edit={edit}
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

export function ViewGroup({ group }) {
  return (
    <Box
      fill
      gap="small"
    >
      <Switch
        checked={group.global}
        disabled
      >
        apply group globally
      </Switch>
      <GroupMembers
        group={group}
      />
    </Box>
  )
}

export function UpdateGroup({ group, cancel }) {
  const client = useApolloClient()
  const [view, setView] = useState('attributes')
  const [value, setValue] = useState('')
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description)
  const [global, setGlobal] = useState(group.global)
  const [mutation, { loading, error }] = useMutation(UPDATE_GROUP, {
    variables: { id: group.id, attributes: { name, description, global } },
    onCompleted: () => cancel(),
  })
  const [addMut] = useMutation(CREATE_GROUP_MEMBERS, {
    variables: { groupId: group.id },
    update: (cache, { data: { createGroupMember } }) => updateCache(cache, {
      query: GROUP_MEMBERS,
      variables: { id: group.id },
      update: prev => appendConnection(prev, createGroupMember, 'groupMembers'),
    }),
  })
  const [suggestions, setSuggestions] = useState([])

  return (
    <Box
      fill
      gap="small"
    >
      {error && (
        <GqlError
          header="Something broke"
          error={error}
        />
      )}
      <Flex>
        <Tab
          active={view === 'attributes'}
          onClick={() => setView('attributes')}
        >Attributes
        </Tab>
        <Tab
          active={view === 'users'}
          onClick={() => setView('users')}
        >Users
        </Tab>
        <Div
          flexGrow={1}
          borderBottom="1px solid border"
        />
      </Flex>
      {view === 'attributes' && (
        <Box
          gap="small"
          fill
        >
          <ValidatedInput
            value={name}
            onChange={({ target: { value } }) => setName(value)}
            label="Name"
          />
          <ValidatedInput
            label="Description"
            value={description}
            onChange={({ target: { value } }) => setDescription(value)}
          />
          <Switch
            checked={global}
            onChange={({ target: { checked } }) => setGlobal(checked)}
          >
            Global
          </Switch>
          <Actions
            cancel={cancel}
            submit={mutation}
            loading={loading}
            action="Update"
          />
        </Box>
      )}
      {view === 'users' && (
        <Box
          gap="small"
          fill
        >
          <FormField
            label="Add users"
            width="100%"
          >
            <TextInput
              icon={<PersonIcon size={14} />}
              width="100%"
              value={value}
              placeholder="Search for users by name"
              suggestions={suggestions}
              onChange={({ target: { value } }) => {
                setValue(value)
                fetchUsers(client, value, setSuggestions)
              }}
              onSelect={({ suggestion: { value } }) => {
                setValue('')
                addMut({ variables: { userId: value.id } })
              }}
            />
          </FormField>
          <GroupMembers
            group={group}
            edit
          />
        </Box>
      )}
    </Box>
  )
}

export function CreateGroup({ q }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mutation, { loading, error }] = useMutation(CREATE_GROUP, {
    variables: { attributes: { name, description } },
    onCompleted: () => setOpen(false),
    update: (cache, { data: { createGroup } }) => updateCache(cache, {
      query: GROUPS_Q,
      variables: { q },
      update: prev => appendConnection(prev, createGroup, 'groups'),
    }),
  })

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Group</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        maxHeight="400px"
      >
        <ModalHeader onClose={() => setOpen(false)}>
          CREATE GROUP
        </ModalHeader>
        <Box
          width="50vw"
          gap="small"
        >
          {error && (
            <GqlError
              header="Something broke"
              error={error}
            />
          )}
          <ValidatedInput
            value={name}
            onChange={({ target: { value } }) => setName(value)}
            label="Name"
          />
          <ValidatedInput
            label="Description"
            value={description}
            onChange={({ target: { value } }) => setDescription(value)}
          />
          <ModalActions>
            <Button
              secondary
              onClick={() => setOpen(false)}
            >Cancel
            </Button>
            <Button
              onClick={mutation}
              loading={loading}
              marginLeft="medium"
            >Create
            </Button>
          </ModalActions>
        </Box>
      </Modal>
    </>
  )
}
