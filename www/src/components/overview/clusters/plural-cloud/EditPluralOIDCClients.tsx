import {
  Button,
  Flex,
  ListBoxItem,
  Modal,
  Select,
} from '@pluralsh/design-system'
import { FormFieldSC } from 'components/create-cluster/steps/ConfigureCloudInstanceStep'
import {
  ConsoleInstanceFragment,
  ConsoleSize,
  useGroupMembersQuery,
  useNotificationsQuery,
  useOidcProvidersQuery,
  useUpdateConsoleInstanceMutation,
} from 'generated/graphql'
import { useMemo, useState } from 'react'

import { GqlError } from 'components/utils/Alert'

import { useTheme } from 'styled-components'

import { firstLetterUppercase } from './CloudInstanceTableCols'
import { useFetchPaginatedData } from '../../../utils/useFetchPaginatedData'
import { mapExistingNodes } from '../../../../utils/graphql'

export function EditPluralOIDCClientsModal({
  open,
  onClose,
  instance,
}: {
  open: boolean
  onClose: () => void
  instance: ConsoleInstanceFragment
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      header={`${instance.name} - Edit Plural OIDC clients`}
    >
      <EditPluralOIDCClients
        onClose={onClose}
        instance={instance}
      />
    </Modal>
  )
}

function EditPluralOIDCClients({
  onClose,
  instance,
}: {
  onClose: () => void
  instance: ConsoleInstanceFragment
}) {
  const theme = useTheme()
  const { data, loading, pageInfo, fetchNextPage } = useFetchPaginatedData(
    { queryHook: useOidcProvidersQuery, keyPath: ['oidcProviders'] },
    {}
  )

  const oidcProviders = useMemo(
    () => mapExistingNodes(data?.oidcProviders),
    [data?.oidcProviders]
  )

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xlarge,
      }}
    >
      {JSON.stringify(oidcProviders)}
      <Button
        secondary
        onClick={onClose}
        css={{ alignSelf: 'flex-end' }}
      >
        Cancel
      </Button>
    </div>
  )
}
