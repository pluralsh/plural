import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Box } from 'grommet'
import { Button, Modal, ValidatedInput } from '@pluralsh/design-system'

import { appendConnection, updateCache } from '../../utils/graphql'

import { GqlError } from '../utils/Alert'

import { GroupsDocument, useCreateGroupMutation } from '../../generated/graphql'

import SubscriptionContext from '../../contexts/SubscriptionContext'

export function CreateGroup({ q }: any) {
  const { availableFeatures } = useContext(SubscriptionContext)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errorMsg, setErrorMsg] = useState<ReactNode>()

  const resetAndClose = useCallback(() => {
    setName('')
    setDescription('')
    setOpen(false)
    setErrorMsg(undefined)
  }, [])

  const [mutation, { loading, error }] = useCreateGroupMutation({
    variables: { attributes: { name, description } },
    onCompleted: () => resetAndClose(),
    update: (cache, { data }) => updateCache(cache, {
      query: GroupsDocument,
      variables: { q },
      update: prev => appendConnection(prev, data?.createGroup, 'groups'),
    }),
  })

  useEffect(() => {
    setErrorMsg(error && (
      <GqlError
        header="Problem creating group"
        error={error}
      />
    ))
  }, [error])

  return (
    <>
      <Button
        secondary
        onClick={() => setOpen(true)}
        disabled={!availableFeatures?.userManagement}
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
          {errorMsg}
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
