import { useMutation } from '@apollo/client'
import { Box } from 'grommet'
import {
  Button,
  Modal,
  ModalActions,
  ModalHeader, ValidatedInput,
} from 'pluralsh-design-system'
import { useCallback, useState } from 'react'

import { appendConnection, updateCache } from '../../utils/graphql'
import { CREATE_GROUP, GROUPS_Q } from '../accounts/queries'
import { GqlError } from '../utils/Alert'

export function CreateGroup({ q }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const resetAndClose = useCallback(() => {
    setName('')
    setDescription(null)
    setOpen(false)
  }, [])
  const [mutation, { loading, error }] = useMutation(CREATE_GROUP, {
    variables: { attributes: { name, description } },
    onCompleted: () => resetAndClose(),
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
        Create group
      </Button>
      <Modal
        open={open}
        onClose={() => resetAndClose()}
        maxHeight="400px"
      >
        <ModalHeader>Create group</ModalHeader>
        <Box
          width="50vw"
          gap="small"
        >
          {error && (
            <GqlError
              header="Something went wrong"
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
              onClick={() => resetAndClose()}
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
