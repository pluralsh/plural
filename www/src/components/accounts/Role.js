import { useCallback, useRef, useState } from 'react'
import { Box, Layer, Text } from 'grommet'
import { GqlError, Group, InputCollection, TagInput, Trash, User } from 'forge-core'
import { Edit } from 'grommet-icons'
import { Button, Div } from 'honorable'

import { useApolloClient, useMutation } from '@apollo/client'

import Toggle from 'react-toggle'

import ResponsiveInput from '../ResponsiveInput'
import { ModalHeader } from '../ModalHeader'

import { appendConnection, removeConnection, updateCache } from '../../utils/graphql'

import { Icon } from './Group'
import { CREATE_ROLE, DELETE_ROLE, ROLES_Q, UPDATE_ROLE } from './queries'
import { PermissionTypes } from './types'
import { fetchGroups, fetchUsers } from './Typeaheads'

function RoleName({ role: { name, description } }) {
  return (
    <Box
      direction="row"
      fill="horizontal"
      align="center"
      gap="xsmall"
    >
      <Text
        size="small"
        weight={500}
      >{name}
      </Text>
      <Text size="small">--</Text>
      <Text size="small"><i>{description || 'no description'}</i></Text>
    </Box>
  )
}

function PermissionToggle({ permission, description, attributes, setAttributes }) {
  const toggle = useCallback(enable => {
    if (enable) {
      setAttributes({ ...attributes, permissions: [permission, ...attributes.permissions] })
    }
    else {
      setAttributes({ ...attributes, permissions: attributes.permissions.filter(perm => perm !== permission) })
    }
  }, [permission, attributes, setAttributes])

  return (
    <Box
      direction="row"
      gap="small"
      align="center"
    >
      <Box
        fill="horizontal"
        direction="row"
        gap="xsmall"
      >
        <Text
          size="small"
          weight={500}
        >{permission.toLowerCase()}
        </Text>
        <Text size="small"><i>{description}</i></Text>
      </Box>
      <Box flex={false}>
        <Toggle
          checked={!!attributes.permissions.find(perm => perm === permission)}
          onChange={({ target: { checked } }) => toggle(checked)}
        />
      </Box>
    </Box>
  )
}

const ICONS = {
  user: <User size="14px" />,
  group: <Group size="14px" />,
}

const TEXT = {
  user: { label: 'user bindings', placeholder: 'search for users to add' },
  group: { label: 'group bindings', placeholder: 'search for groups to add' },
}

export function BindingInput({ type, fetcher, bindings, remove, add }) {
  const client = useApolloClient()
  const [suggestions, setSuggestions] = useState([])
  const { placeholder, label } = TEXT[type]

  return (
    <Box
      direction="row"
      align="center"
      gap="small"
    >
      <Box
        flex={false}
        width="125px"
        direction="row"
        gap="small"
        align="center"
      >
        {type && ICONS[type]}
        <Text
          size="small"
          weight={500}
        >{label}
        </Text>
      </Box>
      <TagInput
        noborder
        placeholder={placeholder}
        round="xsmall"
        suggestions={suggestions}
        value={bindings}
        onRemove={remove}
        onAdd={({ value }) => add(value)}
        onChange={({ target: { value } }) => fetcher(client, value, setSuggestions)}
      />
    </Box>
  )
}

function RoleForm({ attributes, setAttributes, roleBindings, setRoleBindings }) {
  const [repositories, setRepositories] = useState(attributes.repositories.join(', '))

  return (
    <Box
      pad="small"
      gap="small"
    >
      <InputCollection>
        <ResponsiveInput
          label="name"
          value={attributes.name}
          placeholder="name of the role"
          labelWidth={128}
          onChange={({ target: { value } }) => setAttributes({ ...attributes, name: value })}
        />
        <Div mt={0.5}>
          <ResponsiveInput
            label="description"
            value={attributes.description}
            placeholder="description for the role"
            labelWidth={128}
            onChange={({ target: { value } }) => setAttributes({ ...attributes, description: value })}
          />
        </Div>
        <Div mt={0.5}>
          <ResponsiveInput
            label="repositories"
            value={repositories}
            placeholder="repositories for the role to apply to (comma separated, use * for any)"
            labelWidth={128}
            onChange={({ target: { value } }) => {
              setRepositories(value)
              setAttributes({ ...attributes, repositories: value.split(',') })
            }}
          />
        </Div>
      </InputCollection>
      <Box
        pad="small"
        gap="xsmall"
        border="horizontal"
      >
        <BindingInput
          type="user"
          bindings={roleBindings.filter(({ user }) => !!user).map(({ user: { email } }) => email)}
          fetcher={fetchUsers}
          add={user => setRoleBindings([...roleBindings, { user }])}
          remove={email => setRoleBindings(roleBindings.filter(({ user }) => !user || user.email !== email))}
        />
        <BindingInput
          type="group"
          bindings={roleBindings.filter(({ group }) => !!group).map(({ group: { name } }) => name)}
          fetcher={fetchGroups}
          add={group => setRoleBindings([...roleBindings, { group }])}
          remove={name => setRoleBindings(roleBindings.filter(({ group }) => !group || group.name !== name))}
        />
      </Box>
      <Box
        pad="small"
        round="xsmall"
        gap="xsmall"
      >
        <Text size="small">Permissions</Text>
        {Object.entries(PermissionTypes).map(([perm, description]) => (
          <PermissionToggle
            key={perm}
            permission={perm}
            description={description}
            attributes={attributes}
            setAttributes={setAttributes}
          />
        ))}
      </Box>
    </Box>
  )
}

export const sanitize = ({ id, user, group }) => ({ id, userId: user && user.id, groupId: group && group.id })

function EditRole({ role, setOpen }) {
  const [attributes, setAttributes] = useState({
    name: role.name,
    description: role.description,
    repositories: role.repositories,
    permissions: role.permissions,
  })
  const [roleBindings, setRoleBindings] = useState(role.roleBindings)
  const [mutation, { loading, error }] = useMutation(UPDATE_ROLE, {
    variables: { id: role.id, attributes: { ...attributes, roleBindings: roleBindings.map(sanitize) } },
    onCompleted: () => setOpen(null),
  })

  return (
    <Box
      gap="small"
      pad="small"
    >
      {error && (
        <GqlError
          error={error}
          header="Could not create role"
        />
      )}
      <RoleForm
        attributes={attributes}
        setAttributes={setAttributes}
        roleBindings={roleBindings}
        setRoleBindings={setRoleBindings}
      />
      <Box
        direction="row"
        fill="horizontal"
        justify="end"
      >
        <Button
          loading={loading}
          onClick={mutation}
        >
          Update
        </Button>
      </Box>
    </Box>
  )
}

export function CreateRole({ setOpen }) {
  const [attributes, setAttributes] = useState({ name: '', description: '', repositories: [], permissions: [] })
  const [roleBindings, setRoleBindings] = useState([])
  const [mutation, { loading, error }] = useMutation(CREATE_ROLE, {
    variables: {
      attributes: { ...attributes, roleBindings: roleBindings.map(sanitize) },
    },
    update: (cache, { data: { createRole } }) => updateCache(cache, {
      query: ROLES_Q,
      variables: { q: null },
      update: prev => appendConnection(prev, createRole, 'roles'),
    }),
    onCompleted: () => setOpen && setOpen(false),
  })

  return (
    <Box
      gap="small"
      pad="small"
    >
      {error && (
        <GqlError
          error={error}
          header="Could not create role"
        />
      )}
      <RoleForm
        attributes={attributes}
        setAttributes={setAttributes}
        roleBindings={roleBindings}
        setRoleBindings={setRoleBindings}
      />
      <Box
        direction="row"
        fill="horizontal"
        justify="end"
      >
        <Button
          loading={loading}
          onClick={mutation}
        >
          Create
        </Button>
      </Box>
    </Box>
  )
}

export function RoleCreator() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Box flex={false}>
        <Button
          onClick={() => setOpen(true)}
        >
          Create
        </Button>
      </Box>
      {open && (
        <Layer modal>
          <ModalHeader
            text="Create a new role"
            setOpen={setOpen}
          />
          <Box width="40vw">
            <CreateRole setOpen={setOpen} />
          </Box>
        </Layer>
      )}
    </>
  )
}

export default function RoleRow({ role }) {
  const ref = useRef()
  const [modal, setModal] = useState(null)
  const [mutation] = useMutation(DELETE_ROLE, {
    variables: { id: role.id },
    update: (cache, { data }) => updateCache(cache, {
      query: ROLES_Q,
      variables: { q: null },
      update: prev => removeConnection(prev, data.deleteRole, 'roles'),
    }),
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
        <RoleName role={role} />
        <Box
          flex={false}
          direction="row"
        >
          <Icon
            icon={Edit}
            tooltip="edit"
            onClick={() => setModal({
              text: `Edit role ${role.name}`,
              body: <EditRole
                role={role}
                setOpen={setModal}
              />,
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
          <Box width="50vw">
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
