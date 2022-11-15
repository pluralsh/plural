import { useCallback, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Box } from 'grommet'
import { Button, Modal, ValidatedInput } from '@pluralsh/design-system'

import { appendConnection, updateCache } from '../../utils/graphql'

import { GqlError } from '../utils/Alert'

import { CREATE_GROUP, GROUPS_Q } from './queries'

export function CreateGroup({ q }: any) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const resetAndClose = useCallback(() => {
    setName('')
    setDescription('')
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
        header="Create group"
        open={open}
        onClose={() => resetAndClose()}
        actions={(
          <>
            <Button
              secondary
              onClick={() => resetAndClose()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => mutation()}
              loading={loading}
              marginLeft="medium"
            >
              Create
            </Button>
          </>
        )}
      >
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
        </Box>
      </Modal>
    </>
  )
}
