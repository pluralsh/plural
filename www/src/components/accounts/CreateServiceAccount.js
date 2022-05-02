import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Button, InputCollection } from 'forge-core'
import { Div } from 'honorable'
import { Box, Layer } from 'grommet'

import { appendConnection, updateCache } from '../../utils/graphql'

import ResponsiveInput from '../ResponsiveInput'
import { ModalHeader } from '../ModalHeader'
import { GqlError } from '../utils/Alert'

import { BindingInput, sanitize } from './Role'
import { fetchGroups, fetchUsers } from './Typeaheads'
import { CREATE_SERVICE_ACCOUNT, UPDATE_SERVICE_ACCOUNT, USERS_Q } from './queries'

export function ServiceAccountForm({ attributes, setAttributes, bindings, setBindings }) {
  return (
    <Box
      fill
      pad="small"
      gap="small"
    >
      <InputCollection>
        <ResponsiveInput
          label="name"
          value={attributes.name}
          placeholder="name of the service account"
          onChange={({ target: { value } }) => setAttributes({ ...attributes, name: value })}
        />
        <Div mt={0.5}>
          <ResponsiveInput
            label="email"
            value={attributes.email}
            placeholder="email for the service account"
            onChange={({ target: { value } }) => setAttributes({ ...attributes, email: value })}
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
          bindings={bindings.filter(({ user }) => !!user).map(({ user: { email } }) => email)}
          fetcher={fetchUsers}
          add={user => setBindings([...bindings, { user }])}
          remove={email => setBindings(bindings.filter(({ user }) => !user || user.email !== email))}
        />
        <BindingInput
          type="group"
          bindings={bindings.filter(({ group }) => !!group).map(({ group: { name } }) => name)}
          fetcher={fetchGroups}
          add={group => setBindings([...bindings, { group }])}
          remove={name => setBindings(bindings.filter(({ group }) => !group || group.name !== name))}
        />
      </Box>
    </Box>
  )
}

function CreateInner({ setOpen }) {
  const [attributes, setAttributes] = useState({ name: '', email: '' })
  const [bindings, setBindings] = useState([])
  const [mutation, { loading, error }] = useMutation(CREATE_SERVICE_ACCOUNT, {
    variables: { attributes: { ...attributes, impersonationPolicy: { bindings: bindings.map(sanitize) } } },
    update: (cache, { data: { createServiceAccount } }) => updateCache(cache, {
      query: USERS_Q,
      variables: { q: null, serviceAccount: true },
      update: prev => appendConnection(prev, createServiceAccount, 'users'),
    }),
    onCompleted: () => setOpen(false),
  })

  return (
    <Box fill>
      {error && (
        <GqlError
          error={error}
          header="Error creating service account"
        />
      )}
      <ServiceAccountForm
        attributes={attributes}
        setAttributes={setAttributes}
        bindings={bindings}
        setBindings={setBindings}
      />
      <Box
        direction="row"
        fill="horizontal"
        justify="end"
        pad="small"
      >
        <Button
          flex={false}
          label="Create"
          loading={loading}
          onClick={mutation}
        />
      </Box>
    </Box>
  )
}

export function UpdateServiceAccount({ user, setOpen }) {
  const [attributes, setAttributes] = useState({ name: user.name, email: user.email })
  const [bindings, setBindings] = useState(user.impersonationPolicy.bindings)
  const [mutation, { loading, error }] = useMutation(UPDATE_SERVICE_ACCOUNT, {
    variables: {
      id: user.id,
      attributes: { ...attributes, impersonationPolicy: { bindings: bindings.map(sanitize) } },
    },
    onCompleted: () => setOpen(false),
  })

  return (
    <Box
      fill
      gap="xsmall"
    >
      {error && (
        <GqlError
          error={error}
          header="Error creating service account"
        />
      )}
      <ServiceAccountForm
        attributes={attributes}
        setAttributes={setAttributes}
        bindings={bindings}
        setBindings={setBindings}
      />
      <Box
        direction="row"
        fill="horizontal"
        justify="end"
        pad="small"
      >
        <Button
          flex={false}
          label="Update"
          loading={loading}
          onClick={mutation}
        />
      </Box>
    </Box>
  )
}

export function CreateServiceAccount() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        label="Create"
        onClick={() => setOpen(true)}
      />
      {open && (
        <Layer modal>
          <ModalHeader
            text="Create a new service account"
            setOpen={setOpen}
          />
          <Box width="40vw">
            <CreateInner setOpen={setOpen} />
          </Box>
        </Layer>
      )}
    </>
  )
}
