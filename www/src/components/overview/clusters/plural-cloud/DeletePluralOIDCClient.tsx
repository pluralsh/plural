import { Button, Input, Modal } from '@pluralsh/design-system'
import {
  OidcProviderFragment,
  useDeleteProviderMutation,
} from 'generated/graphql'
import { useTheme } from 'styled-components'

import { GqlError } from '../../../utils/Alert'
import { useState } from 'react'

export function DeletePluralOIDCClientModal({
  open,
  onClose,
  provider,
  insideModal = false,
  refetch,
}: {
  open: boolean
  onClose: () => void
  provider?: OidcProviderFragment
  insideModal?: boolean
  refetch: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      overlayStyles={{ background: insideModal ? 'none' : undefined }}
      header={`Confirm deletion`}
      size="large"
    >
      <DeletePluralOIDCClient
        onClose={onClose}
        provider={provider}
        refetch={refetch}
      />
    </Modal>
  )
}

function DeletePluralOIDCClient({
  onClose,
  provider,
  refetch,
}: {
  onClose: () => void
  provider?: OidcProviderFragment
  refetch: () => void
}) {
  const theme = useTheme()
  const [confirmText, setConfirmText] = useState('')

  const [mutation, { loading, error }] = useDeleteProviderMutation({
    variables: { id: provider?.id ?? '' },
    onCompleted: () => {
      onClose()
      refetch()
    },
  })

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xlarge,
      }}
    >
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.small,
        }}
      >
        <p>
          Are you sure you want to delete this OIDC client? This action is not
          reversible.
          <br />
          <br />
          Type "
          <span css={{ color: theme.colors['text-danger'] }}>
            {provider?.name}
          </span>
          " to confirm deletion.
        </p>
        <Input
          placeholder="Enter OIDC client name"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
      </div>
      {error && (
        <GqlError
          error={error}
          header={`Delete OIDC provider request failed`}
        />
      )}
      <div
        css={{
          display: 'flex',
          justifyContent: 'end',
          gap: theme.spacing.small,
        }}
      >
        <Button
          secondary
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          destructive
          disabled={confirmText !== provider?.name}
          loading={loading}
          onClick={mutation}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
