import { useTheme } from 'styled-components'

import { Button, Flex, Input, Modal } from '@pluralsh/design-system'
import { GqlError } from 'components/utils/Alert'
import {
  ConsoleInstanceFragment,
  useDeleteConsoleInstanceMutation,
} from 'generated/graphql'
import { useState } from 'react'
import {
  CUR_CONSOLE_INSTANCE_KEY,
  clearCreateClusterState,
} from 'components/create-cluster/CreateCluster'

export function DeleteInstanceModal({
  open,
  onClose,
  refetch,
  instance,
}: {
  open: boolean
  onClose: () => void
  refetch: () => void
  instance: ConsoleInstanceFragment
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      header="Confirm deletion"
    >
      <DeleteInstance
        instance={instance}
        onClose={onClose}
        refetch={refetch}
      />
    </Modal>
  )
}

function DeleteInstance({
  onClose,
  refetch,
  instance,
}: {
  onClose: () => void
  refetch: () => void
  instance: ConsoleInstanceFragment
}) {
  const theme = useTheme()
  const [mutation, { loading, error }] = useDeleteConsoleInstanceMutation({
    variables: { id: instance.id },
    onCompleted: () => {
      if (
        `"${instance.id}"` ===
        localStorage.getItem(`plural-${CUR_CONSOLE_INSTANCE_KEY}`)
      ) {
        clearCreateClusterState()
      }
      onClose()
      refetch()
    },
  })

  const [confirmText, setConfirmText] = useState('')

  return (
    <Flex
      direction="column"
      gap="large"
    >
      {error && <GqlError error={error} />}
      <span>
        Are you sure you want to delete this cloud instance? This action is not
        reversible.
      </span>
      <span>
        Type "
        <span css={{ color: theme.colors['text-danger'] }}>
          {instance.name}
        </span>
        " to confirm deletion.
      </span>
      <Input
        placeholder="Enter instance name"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
      />
      <Flex
        gap="medium"
        alignSelf="flex-end"
        marginTop={theme.spacing.medium}
      >
        <Button
          secondary
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          destructive
          disabled={confirmText !== instance.name}
          loading={loading}
          onClick={() => mutation()}
        >
          Delete
        </Button>
      </Flex>
    </Flex>
  )
}
