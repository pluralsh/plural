import {
  AppIcon,
  Button,
  ConsoleIcon,
  Flex,
  ListBoxItem,
  Modal,
  PlusIcon,
  Select,
  Table,
} from '@pluralsh/design-system'
import { FormFieldSC } from 'components/create-cluster/steps/ConfigureCloudInstanceStep'
import {
  ConsoleInstanceFragment,
  ConsoleSize,
  OidcProviderFragment,
  useGroupMembersQuery,
  useNotificationsQuery,
  useOidcProvidersQuery,
  useUpdateConsoleInstanceMutation,
} from 'generated/graphql'
import { useMemo, useState } from 'react'

import { GqlError } from 'components/utils/Alert'

import { useTheme } from 'styled-components'

import { firstLetterUppercase } from './CloudInstanceTableCols'
import {
  DEFAULT_REACT_VIRTUAL_OPTIONS,
  useFetchPaginatedData,
} from '../../../utils/useFetchPaginatedData'
import { mapExistingNodes } from '../../../../utils/graphql'
import { createColumnHelper } from '@tanstack/react-table'
import { CellWrap } from '../SelfHostedTableCols'

const columnHelper = createColumnHelper<OidcProviderFragment>()

const columns = [
  columnHelper.accessor((row) => row, {
    id: 'name',
    enableSorting: true,
    cell: ({ getValue }) => {
      const oidcProvider = getValue()

      return <div>{oidcProvider.name}</div>
    },
  }),
]

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
  const { data, loading, pageInfo, setVirtualSlice, fetchNextPage } =
    useFetchPaginatedData(
      { queryHook: useOidcProvidersQuery, keyPath: ['oidcProviders'] },
      {}
    )

  const oidcProviders = useMemo(
    () => mapExistingNodes(data?.oidcProviders) ?? [],
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
      <div
        css={{
          border: theme.borders['fill-two'],
          borderRadius: theme.borderRadiuses.large,
        }}
      >
        <Table
          virtualizeRows
          rowBg="raised"
          data={oidcProviders}
          columns={columns}
          hideHeader
          hasNextPage={pageInfo?.hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={loading}
          onVirtualSliceChange={setVirtualSlice}
          reactVirtualOptions={DEFAULT_REACT_VIRTUAL_OPTIONS}
          style={{
            border: 'none',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            height: '100%',
          }}
        />
        <div
          css={{
            ...theme.partials.text.body2Bold,
            borderTop: theme.borders['fill-two'],
            display: 'flex',
            justifyContent: 'space-between',
            padding: theme.spacing.medium,

            '&:hover': {
              backgroundColor: theme.colors['fill-one-hover'],
              cursor: 'pointer',
            },
          }}
        >
          Add new Plural OIDC client <PlusIcon color={'icon-light'} />
        </div>
      </div>
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
