import { useMutation } from '@apollo/client'
import { Box } from 'grommet'
import {
  Button, Div, MenuItem, Span,
} from 'honorable'
import {
  Modal, ModalActions, ModalHeader, ValidatedInput,
} from 'pluralsh-design-system'
import { useState } from 'react'

import { appendConnection, updateCache } from '../../utils/graphql'
import { CREATE_SERVICE_ACCOUNT, UPDATE_SERVICE_ACCOUNT, USERS_Q } from '../accounts/queries'
import { DELETE_USER } from '../users/queries'
import { GqlError } from '../utils/Alert'

import { Confirm } from './Confirm'
import { MoreMenu } from './MoreMenu'

import { BindingInput } from './Typeaheads'
import { sanitize } from './utils'

function ServiceAccountForm({
  error, attributes, setAttributes, bindings, setBindings, ...box
}) {
  return (
    <Box
      fill
      pad="small"
      gap="small"
      {...box}
    >
      {error && (
        <GqlError
          header="Something broke"
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
        hint="users that can impersonate this service account"
        bindings={bindings.filter(({ user }) => !!user).map(({ user: { email } }) => email)}
        add={user => setBindings([...bindings, { user }])}
        remove={email => setBindings(bindings.filter(({ user }) => !user || user.email !== email))}
      />
      <BindingInput
        type="group"
        hint="user groups that can impersonate this service account"
        bindings={bindings.filter(({ group }) => !!group).map(({ group: { name } }) => name)}
        add={group => setBindings([...bindings, { group }])}
        remove={name => setBindings(bindings.filter(({ group }) => !group || group.name !== name))}
      />
    </Box>

  )
}

export function EditServiceAccount({ user, update }) {
  const [confirm, setConfirm] = useState(false)
  const [edit, setEdit] = useState(false)
  const [attributes, setAttributes] = useState({ name: user.name, email: user.email })
  const [bindings, setBindings] = useState(user.impersonationPolicy.bindings)
  const [mutation, { loading: eloading, error: eerror }] = useMutation(UPDATE_SERVICE_ACCOUNT, {
    variables: { id: user.id, attributes: { ...attributes, impersonationPolicy: { bindings: bindings.map(sanitize) } } },
    onCompleted: () => setEdit(false),
  })
  const [deleteMut, { loading, error }] = useMutation(DELETE_USER, {
    variables: { id: user.id },
    update,
    onCompleted: () => setConfirm(false),
  })

  return (
    <>
      <MoreMenu>
        <MenuItem onClick={() => setEdit(true)}>
          <Span color="text-light">Edit</Span>
        </MenuItem>
        <MenuItem onClick={() => setConfirm(true)}>
          <Span color="text-error">Delete user</Span>
        </MenuItem>
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
        portal
        open={edit}
        onClose={() => setEdit(false)}
      >
        <ModalHeader onClose={() => setEdit(false)}>
          UPDATE SERVICE ACCOUNT
        </ModalHeader>
        <Box
          flex={false}
          gap="small"
          width="50vw"
        >
          <ServiceAccountForm
            error={eerror}
            attributes={attributes}
            setAttributes={setAttributes}
            bindings={bindings}
            setBindings={setBindings}
          />
          <ModalActions>
            <Button
              secondary
              onClick={() => setEdit(false)}
            >Cancel
            </Button>
            <Button
              onClick={mutation}
              loading={eloading}
              marginLeft="medium"
            >Update
            </Button>
          </ModalActions>
        </Box>
      </Modal>
    </>
  )
}

export function CreateServiceAccount({ q }) {
  const [open, setOpen] = useState(false)
  const [attributes, setAttributes] = useState({ name: '', email: '' })
  const [bindings, setBindings] = useState([])
  const [mutation, { loading, error }] = useMutation(CREATE_SERVICE_ACCOUNT, {
    variables: { attributes: { ...attributes, impersonationPolicy: { bindings: bindings.map(sanitize) } } },
    update: (cache, { data: { createServiceAccount } }) => updateCache(cache, {
      query: USERS_Q,
      variables: { q, serviceAccount: true },
      update: prev => appendConnection(prev, createServiceAccount, 'users'),
    }),
    onCompleted: () => setOpen(false),
  })

  return (
    <>
      <Div>
        <Button onClick={() => setOpen(true)}>Create</Button>
      </Div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
        <ModalHeader onClose={() => setOpen(false)}>
          CREATE SERVICE ACCOUNT
        </ModalHeader>
        <Box
          flex={false}
          gap="small"
          width="50vw"
        >
          <ServiceAccountForm
            error={error}
            attributes={attributes}
            setAttributes={setAttributes}
            bindings={bindings}
            setBindings={setBindings}
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
