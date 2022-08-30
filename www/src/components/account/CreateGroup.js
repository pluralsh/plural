import { useMutation } from '@apollo/client'
import { Box } from 'grommet'
import {
  Button,
  Modal,
  ModalActions,
  ModalHeader, ValidatedInput,
} from 'pluralsh-design-system'
import { useMemo, useState } from 'react'
import uniqWith from 'lodash/uniqWith'
import isEqual from 'lodash/isEqual'

import { appendConnection, updateCache } from '../../utils/graphql'
import { CREATE_GROUP, GROUPS_Q } from '../accounts/queries'
import { GqlError } from '../utils/Alert'

import { BindingInput } from './Typeaheads'

export function CreateGroup({ q }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [bindings, setBindings] = useState([])
  const uniqueBindings = useMemo(() => uniqWith(bindings, isEqual),
    [bindings])
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
      <Button
        secondary
        onClick={() => setOpen(true)}
      >
        Create Group
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        maxHeight="400px"
      >
        <ModalHeader>Create group</ModalHeader>
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
          <BindingInput
            type="user"
            hint="users that will receive this role"
            bindings={uniqueBindings
              .filter(({ user }) => !!user)
              .map(({ user: { email } }) => email)}
            add={user => setBindings([...bindings, { user }])}
            remove={email => setBindings(bindings.filter(({ user }) => !user || user.email !== email))}
          />
          <ModalActions>
            <Button
              secondary
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={mutation}
              loading={loading}
              marginLeft="medium"
            >
              Create
            </Button>
          </ModalActions>
        </Box>
      </Modal>
    </>
  )
}
