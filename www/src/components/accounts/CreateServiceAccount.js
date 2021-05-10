import React, { useState } from 'react'
import { useMutation } from 'react-apollo'
import { Button, ModalHeader, InputCollection, ResponsiveInput } from 'forge-core'
import { BindingInput, sanitize } from './Role'
import { fetchGroups, fetchUsers } from './Typeaheads'
import { Box, Layer } from 'grommet'
import { CREATE_SERVICE_ACCOUNT, USERS_Q } from './queries'
import { updateCache, appendConnection } from '../../utils/graphql'

export function ServiceAccountForm({attributes, setAttributes, bindings, setBindings}) {
  return (
    <Box fill pad='small'>
      <InputCollection>
        <ResponsiveInput
          label='name'
          value={attributes.name}
          placeholder='name of the service account'
          onChange={({target: {value}}) => setAttributes({...attributes, name: value})} />
      </InputCollection>
      <Box pad='small' gap='xsmall' border='horizontal'>
        <BindingInput
          label='user bindings'
          placeholder='search for users to add'
          bindings={bindings.filter(({user}) => !!user).map(({user: {email}}) => email)}
          fetcher={fetchUsers}
          add={(user) => setBindings([...bindings, {user}])}
          remove={(email) => setBindings(bindings.filter(({user}) => !user || user.email !== email))} />
        <BindingInput
          label='group bindings'
          placeholder='search for groups to add'
          bindings={bindings.filter(({group}) => !!group).map(({group: {name}}) => name)}
          fetcher={fetchGroups}
          add={(group) => setBindings([...bindings, {group}])}
          remove={(name) => setBindings(bindings.filter(({group}) => !group || group.name !== name))} />
      </Box>
    </Box>
  )
}

function CreateInner() {
  const [attributes, setAttributes] = useState({name: ''})
  const [bindings, setBindings] = useState([])
  const [mutation, {loading}] = useMutation(CREATE_SERVICE_ACCOUNT, {
    variables: {attributes: {...attributes, impersonationPolicy: {bindings: bindings.map(sanitize)}}},
    update: (cache, {data: {createServiceAccount}}) => updateCache(cache, {
      query: USERS_Q,
      variables: {q: null, serviceAccount: true},
      update: (prev) => appendConnection(prev, createServiceAccount, 'users')
    })
  })

  return (
    <Box fill gap='xsmall'>
      <ServiceAccountForm 
        attributes={attributes} 
        setAttributes={setAttributes}
        bindings={bindings}
        setBindings={setBindings} />
      <Box fill='horizontal' justify='end' pad='small'>
        <Button label='Create' loading={loading} onClick={mutation} />
      </Box>
    </Box>
  )
}

export function CreateServiceAccount() {
  const [open, setOpen] = useState(false)

  return (
    <>
    <Button label='Create Service Account' />
    {open && (
      <Layer modal>
        <ModalHeader text='Create a new service account' setOpen={setOpen} />
        <Box width='40vw'>
          <CreateInner />
        </Box>
      </Layer>
    )}
    </>
  )
}