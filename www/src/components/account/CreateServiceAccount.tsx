import { useMutation } from '@apollo/client'
import { Box } from 'grommet'
import { Button, Div } from 'honorable'
import { ListBoxItem, Modal, ValidatedInput } from 'pluralsh-design-system'
import { useCallback, useState } from 'react'

import { appendConnection, updateCache } from '../../utils/graphql'

import { DELETE_USER } from '../users/queries'
import { GqlError } from '../utils/Alert'

import {
  CREATE_SERVICE_ACCOUNT,
  UPDATE_SERVICE_ACCOUNT,
  USERS_Q,
} from './queries'

import { Confirm } from './Confirm'
import { MoreMenu } from './MoreMenu'

import { BindingInput } from './Typeaheads'
import { sanitize } from './utils'

function ServiceAccountForm({
  error,
  attributes,
  setAttributes,
  bindings,
  setBindings,
  ...box
}) {
  return (
    <Box
      fill
      gap="small"
      {...box}
    >
      {error && (
        <GqlError
          header="Something went wrong"
          error={error}
        />
      )}
      <ValidatedInput
        label="Name"
        value={attributes.name}
        onChange={({ target: { value } }) => setAttributes({ ...attributes, name: value })}
      />
      <ValidatedInput
        label="Email"
        value={attributes.email}
        onChange={({ target: { value } }) => setAttributes({ ...attributes, email: value })}
      />
      <BindingInput
        type="user"
        hint="Users that can impersonate this service account"
        bindings={bindings
          .filter(({ user }) => !!user)
          .map(({ user: { email } }) => email)}
        add={user => setBindings([...bindings, { user }])}
        remove={email => setBindings(bindings.filter(({ user }) => !user || user.email !== email))}
      />
      <BindingInput
        type="group"
        hint="User groups that can impersonate this service account"
        bindings={bindings
          .filter(({ group }) => !!group)
          .map(({ group: { name } }) => name)}
        add={group => setBindings([...bindings, { group }])}
        remove={name => setBindings(bindings.filter(({ group }) => !group || group.name !== name))}
      />
    </Box>
  )
}

export function EditServiceAccount({ user, update }) {
  const [confirm, setConfirm] = useState(false)
  const [edit, setEdit] = useState(false)
  const [attributes, setAttributes] = useState({
    name: user.name,
    email: user.email,
  })
  const [bindings, setBindings] = useState(user.impersonationPolicy?.bindings || [])
  const [mutation, { loading: eloading, error: eerror }] = useMutation(UPDATE_SERVICE_ACCOUNT,
    {
      variables: {
        id: user.id,
        attributes: {
          ...attributes,
          impersonationPolicy: { bindings: bindings.map(sanitize) },
        },
      },
      onCompleted: () => setEdit(false),
    })
  const [deleteMut, { loading, error }] = useMutation(DELETE_USER, {
    variables: { id: user.id },
    update,
    onCompleted: () => setConfirm(false),
  })

  const menuItems = {
    editUser: {
      label: 'Edit',
      onSelect: () => setEdit(true),
      props: {},
    },
    deleteUser: {
      label: 'Delete user',
      onSelect: () => setConfirm(true),
      props: {
        destructive: true,
      },
    },
  }

  return (
    <>
      <MoreMenu
        onSelectionChange={selectedKey => {
          menuItems[selectedKey]?.onSelect()
        }}
      >
        {Object.entries(menuItems).map(([key, { label, props = {} }]) => (
          <ListBoxItem
            key={key}
            textValue={label}
            label={label}
            {...props}
            color="blue"
          />
        ))}
      </MoreMenu>
      <Confirm
        open={confirm}
        destructive
        close={() => setConfirm(false)}
        error={error}
        title="Confirm deletion"
        text="Be sure this user has no active installations before deleting"
        label="Delete"
        submit={deleteMut}
        loading={loading}
      />
      <Modal
        header="Edit service account"
        portal
        open={edit}
        onClose={() => {
          setEdit(false)
        }}
        actions={(
          <>
            <Button
              secondary
              onClick={() => setEdit(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={mutation}
              loading={eloading}
              marginLeft="medium"
            >
              Update
            </Button>
          </>
        )}
        size="large"
      >
        <Box
          flex={false}
          gap="small"
        >
          <ServiceAccountForm
            error={eerror}
            attributes={attributes}
            setAttributes={setAttributes}
            bindings={bindings}
            setBindings={setBindings}
          />
        </Box>
      </Modal>
    </>
  )
}

const defaultAttributes = { name: '', email: '' }

export function CreateServiceAccount({ q }) {
  const [open, setOpen] = useState(false)
  const [attributes, setAttributes] = useState(defaultAttributes)
  const [bindings, setBindings] = useState([])
  const resetAndClose = useCallback(() => {
    setBindings([])
    setAttributes(defaultAttributes)
    setOpen(false)
  }, [])
  const [mutation, { loading, error }] = useMutation(CREATE_SERVICE_ACCOUNT, {
    variables: {
      attributes: {
        ...attributes,
        impersonationPolicy: { bindings: bindings.map(sanitize) },
      },
    },
    update: (cache, { data: { createServiceAccount } }) => updateCache(cache, {
      query: USERS_Q,
      variables: { q, serviceAccount: true },
      update: prev => appendConnection(prev, createServiceAccount, 'users'),
    }),
    onCompleted: () => {
      resetAndClose()
    },
  })

  return (
    <>
      <Div>
        <Button
          secondary
          onClick={() => setOpen(true)}
        >
          Create service account
        </Button>
      </Div>
      <Modal
        header="Create service account"
        open={open}
        onClose={() => {
          resetAndClose()
          setOpen(false)
        }}
        size="large"
        actions={(
          <>
            <Button
              secondary
              onClick={() => {
                resetAndClose()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={mutation}
              loading={loading}
              marginLeft="medium"
            >
              Create
            </Button>
          </>
        )}
      >
        <Box
          flex={false}
          gap="small"
        >
          <ServiceAccountForm
            error={error}
            attributes={attributes}
            setAttributes={setAttributes}
            bindings={bindings}
            setBindings={setBindings}
          />

        </Box>
      </Modal>
    </>
  )
}
