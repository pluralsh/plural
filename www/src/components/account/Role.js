import { useMutation } from '@apollo/client'
import { Box } from 'grommet'
import { Button, Span, Switch } from 'honorable'
import { Modal, ModalHeader, ValidatedInput } from 'pluralsh-design-system'
import { useCallback, useMemo, useState } from 'react'
import uniqWith from 'lodash/uniqWith'
import isEqual from 'lodash/isEqual'

import { appendConnection, updateCache } from '../../utils/graphql'

import { CREATE_ROLE, ROLES_Q, UPDATE_ROLE } from '../accounts/queries'

import { PermissionTypes } from '../accounts/types'

import { ListItem } from '../profile/ListItem'

import { GqlError } from '../utils/Alert'
import { Tabs } from '../utils/SidebarTabs'

import { Actions } from './Actions'

import { BindingInput } from './Typeaheads'
import { sanitize } from './utils'

function GeneralAttributes({
  attributes,
  setAttributes,
  bindings,
  setBindings,
}) {
  const [repositories, setRepositories] = useState(attributes.repositories.join(', '))

  return (
    <Box
      flex={false}
      gap="small"
    >
      <ValidatedInput
        label="Name"
        value={attributes.name}
        onChange={({ target: { value } }) => setAttributes({ ...attributes, name: value })}
      />
      <ValidatedInput
        label="Description"
        value={attributes.description}
        onChange={({ target: { value } }) => setAttributes({ ...attributes, description: value })}
      />
      <ValidatedInput
        label="Repositories"
        hint="Repositories for the role to apply to. Comma separated or * for any."
        value={repositories}
        onChange={({ target: { value } }) => {
          setRepositories(value)
          setAttributes({ ...attributes, repositories: value.split(',') })
        }}
      />
      <BindingInput
        type="user"
        hint="users that will receive this role"
        bindings={bindings
          .filter(({ user }) => !!user)
          .map(({ user: { email } }) => email)}
        add={user => setBindings([...bindings, { user }])}
        remove={email => setBindings(bindings.filter(({ user }) => !user || user.email !== email))}
      />
      <BindingInput
        type="group"
        hint="groups that will recieve this role"
        bindings={bindings
          .filter(({ group }) => !!group)
          .map(({ group: { name } }) => name)}
        add={group => setBindings([...bindings, { group }])}
        remove={name => setBindings(bindings.filter(({ group }) => !group || group.name !== name))}
      />
    </Box>
  )
}

function PermissionToggle({
  permission,
  description,
  attributes,
  setAttributes,
  first,
  last,
}) {
  const toggle = useCallback(enable => {
    if (enable) {
      setAttributes({
        ...attributes,
        permissions: [permission, ...attributes.permissions],
      })
    }
    else {
      setAttributes({
        ...attributes,
        permissions: attributes.permissions.filter(perm => perm !== permission),
      })
    }
  },
  [permission, attributes, setAttributes])

  return (
    <ListItem
      first={first}
      last={last}
      background="fill-two"
    >
      <Box fill="horizontal">
        <Span fontWeight={500}>{permission.toLowerCase()}</Span>
        <Span color="text-light">{description}</Span>
      </Box>
      <Switch
        checked={!!attributes.permissions.find(perm => perm === permission)}
        onChange={({ target: { checked } }) => toggle(checked)}
      />
    </ListItem>
  )
}

function RoleForm({
  // eslint-disable-next-line
  error,
  attributes,
  setAttributes,
  bindings,
  setBindings,
  ...box
}) {
  const [view, setView] = useState('General')
  const permissions = Object.entries(PermissionTypes)
  const len = permissions.length

  return (
    <Box
      flex={false}
      gap="small"
      {...box}
    >
      {error && (
        <GqlError
          header="Something broke"
          error={error}
        />
      )}
      <Tabs
        tabs={['General', 'Permissions']}
        tab={view}
        setTab={setView}
      />
      {view === 'General' && (
        <GeneralAttributes
          attributes={attributes}
          setAttributes={setAttributes}
          bindings={bindings}
          setBindings={setBindings}
        />
      )}
      {view === 'Permissions' && (
        <Box gap="small">
          <Box>
            <Span fontWeight="bold">Permissions</Span>
            <Span>
              Grant permissions to all users and groups bound to this role
            </Span>
          </Box>
          <Box>
            {permissions.map(([perm, description], i) => (
              <PermissionToggle
                key={perm}
                permission={perm}
                description={description}
                attributes={attributes}
                setAttributes={setAttributes}
                first={i === 0}
                last={i === len - 1}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

const MODAL_DIMS = { width: '1000px' }

export function UpdateRole({ role }) {
  const [open, setOpen] = useState(false)
  const [attributes, setAttributes] = useState({
    name: role.name,
    description: role.description,
    repositories: role.repositories,
    permissions: role.permissions,
  })
  const [roleBindings, setRoleBindings] = useState(role.roleBindings || [])
  const uniqueRoleBindings = useMemo(() => uniqWith(roleBindings, isEqual),
    [roleBindings])

  const [mutation, { loading, error }] = useMutation(UPDATE_ROLE, {
    variables: {
      id: role.id,
      attributes: { ...attributes, roleBindings: roleBindings.map(sanitize) },
    },
    onCompleted: () => setOpen(null),
  })

  return (
    <>
      <Button
        secondary
        small
        onClick={() => setOpen(true)}
      >
        Edit
      </Button>
      <Modal
        portal
        open={open}
        onClose={() => setOpen(false)}
        marginVertical={16}
        {...MODAL_DIMS}
      >
        <ModalHeader onClose={() => setOpen(false)}>UPDATE ROLE</ModalHeader>
        <RoleForm
          attributes={attributes}
          setAttributes={setAttributes}
          bindings={uniqueRoleBindings}
          setBindings={setRoleBindings}
          error={error}
        />
        <Actions
          cancel={() => setOpen(false)}
          submit={mutation}
          loading={loading}
          action="Update"
        />
      </Modal>
    </>
  )
}

// function setUniqueBinding(bindings, setBinding) {
//   return (binding) {
//     if (bindings.find(()=>)
//   }
// }

export function CreateRole({ q }) {
  const [open, setOpen] = useState(false)
  const [attributes, setAttributes] = useState({
    name: '',
    description: '',
    repositories: ['*'],
    permissions: [],
  })
  const [roleBindings, setRoleBindings] = useState([])
  const uniqueRoleBindings = useMemo(() => uniqWith(roleBindings, isEqual),
    [roleBindings])

  const [mutation, { loading, error }] = useMutation(CREATE_ROLE, {
    variables: {
      attributes: { ...attributes, roleBindings: roleBindings.map(sanitize) },
    },
    update: (cache, { data: { createRole } }) => updateCache(cache, {
      query: ROLES_Q,
      variables: { q },
      update: prev => appendConnection(prev, createRole, 'roles'),
    }),
    onCompleted: () => setOpen(null),
  })

  return (
    <>
      <Button
        secondary
        onClick={() => setOpen(true)}
      >
        Create Role
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        marginVertical={16}
        {...MODAL_DIMS}
      >
        <ModalHeader onClose={() => setOpen(false)}>CREATE ROLE</ModalHeader>
        <RoleForm
          attributes={attributes}
          setAttributes={setAttributes}
          bindings={uniqueRoleBindings}
          setBindings={setRoleBindings}
          error={error}
        />
        <Actions
          cancel={() => setOpen(false)}
          submit={mutation}
          loading={loading}
        />
      </Modal>
    </>
  )
}
