import {
  Button,
  IconFrame,
  Modal,
  PencilIcon,
  PlusIcon,
  Table,
} from '@pluralsh/design-system'
import {
  ConsoleInstanceFragment,
  OidcProviderFragment,
  useOidcProvidersQuery,
} from 'generated/graphql'
import { useMemo, useState } from 'react'
import { useTheme } from 'styled-components'
import {
  DEFAULT_REACT_VIRTUAL_OPTIONS,
  useFetchPaginatedData,
} from '../../../utils/useFetchPaginatedData'
import { mapExistingNodes } from '../../../../utils/graphql'
import { createColumnHelper } from '@tanstack/react-table'
import { EditPluralOIDCClientModal } from './EditPluralOIDCClient'
import ImpersonateServiceAccount from '../../../utils/ImpersonateServiceAccount'

export function EditPluralOIDCClientsModal({
  open,
  onClose,
  instance,
}: {
  open: boolean
  onClose: () => void
  instance: ConsoleInstanceFragment
}) {
  const theme = useTheme()

  return (
    <Modal
      open={open}
      onClose={onClose}
      header={`${instance.name} - Edit Plural OIDC clients`}
    >
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.xlarge,
        }}
      >
        <ImpersonateServiceAccount
          id={instance.console?.owner?.id}
          renderIndicators={false}
        >
          <EditPluralOIDCClients
            instanceName={instance.name}
            useModalOverlay={false}
          />
        </ImpersonateServiceAccount>
        <Button
          secondary
          onClick={onClose}
          css={{ alignSelf: 'flex-end' }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  )
}

const columnHelper = createColumnHelper<OidcProviderFragment>()

const columns = [
  columnHelper.accessor((row) => row, {
    id: 'meta',
    cell: function Cell({ getValue }) {
      const theme = useTheme()
      const oidcProvider = getValue()

      return (
        <div>
          <div
            css={{
              ...theme.partials.text.body2Bold,
              color: theme.colors['text'],
            }}
          >
            {oidcProvider.name}
          </div>
          <div
            css={{
              ...theme.partials.text.body2,
              color: theme.colors['text-light'],
            }}
          >
            {oidcProvider.description}
          </div>
        </div>
      )
    },
  }),
  columnHelper.accessor((row) => row, {
    id: 'actions',
    meta: { gridTemplate: 'max-content' },
    cell: function Cell({ getValue }) {
      const oidcProvider = getValue()

      return (
        <IconFrame
          clickable
          icon={<PencilIcon />}
        />
      )
    },
  }),
]

export function EditPluralOIDCClients({
  instanceName,
  useModalOverlay = true,
}: {
  instanceName: string
  useModalOverlay?: boolean
}) {
  const theme = useTheme()
  const [createOpen, setCreateOpen] = useState(false)
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
        }}
        css={{
          td: {
            backgroundColor: theme.colors['fill-one'],
            borderColor: theme.colors['border-fill-two'],
          },
        }}
      />
      <div
        onClick={() => setCreateOpen(true)}
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
      <EditPluralOIDCClientModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        instanceName={instanceName}
        useModalOverlay={useModalOverlay}
      />
    </div>
  )
}
