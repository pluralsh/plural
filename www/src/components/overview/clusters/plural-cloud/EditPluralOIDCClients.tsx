import {
  Button,
  EmptyState,
  IconFrame,
  LoopingLogo,
  Modal,
  PencilIcon,
  PlusIcon,
  Table,
  TrashCanIcon,
} from '@pluralsh/design-system'
import {
  ConsoleInstanceFragment,
  OidcProviderFragment,
  useOidcProvidersQuery,
} from 'generated/graphql'
import { useMemo, useState } from 'react'
import { useTheme } from 'styled-components'

import { createColumnHelper } from '@tanstack/react-table'

import { isEmpty } from 'lodash'

import {
  DEFAULT_REACT_VIRTUAL_OPTIONS,
  useFetchPaginatedData,
} from '../../../utils/useFetchPaginatedData'
import { mapExistingNodes } from '../../../../utils/graphql'

import ImpersonateServiceAccount from '../../../utils/ImpersonateServiceAccount'

import { EditPluralOIDCClientModal } from './EditPluralOIDCClient'

import { DeletePluralOIDCClientModal } from './DeletePluralOIDCClient'

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
      size="large"
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
            insideModal
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

type TableMetaT = {
  instanceName: string
  refetch: () => void
}

const columnHelper = createColumnHelper<OidcProviderFragment>()

const columns = [
  columnHelper.display({
    id: 'meta',
    cell: function Cell({ row: { original: provider } }) {
      const theme = useTheme()

      return (
        <div>
          <div
            css={{
              ...theme.partials.text.body2Bold,
              color: theme.colors.text,
            }}
          >
            {provider.name}
          </div>
          <div
            css={{
              ...theme.partials.text.body2,
              color: theme.colors['text-light'],
            }}
          >
            {provider.description}
          </div>
        </div>
      )
    },
  }),
  columnHelper.display({
    id: 'actions',
    meta: { gridTemplate: 'max-content' },
    cell: function Cell({ row: { original: provider }, table }) {
      const theme = useTheme()
      const [editOpen, setEditOpen] = useState(false)
      const [deleteOpen, setDeleteOpen] = useState(false)
      const { instanceName, refetch } = table.options.meta as TableMetaT

      return (
        <div css={{ display: 'flex', gap: theme.spacing.small }}>
          <IconFrame
            clickable
            onClick={() => setEditOpen(true)}
            icon={<PencilIcon />}
          />
          <IconFrame
            clickable
            onClick={() => setDeleteOpen(true)}
            icon={<TrashCanIcon color="icon-danger" />}
          />
          <EditPluralOIDCClientModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            instanceName={instanceName}
            provider={provider}
            refetch={refetch}
          />
          <DeletePluralOIDCClientModal
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            provider={provider}
            refetch={refetch}
          />
        </div>
      )
    },
  }),
]

export function EditPluralOIDCClients({
  instanceName,
  insideModal = false,
}: {
  instanceName: string
  insideModal?: boolean
}) {
  const theme = useTheme()
  const [createOpen, setCreateOpen] = useState(false)
  const { data, loading, pageInfo, setVirtualSlice, fetchNextPage, refetch } =
    useFetchPaginatedData(
      { queryHook: useOidcProvidersQuery, keyPath: ['oidcProviders'] },
      {}
    )

  const oidcProviders = useMemo(
    () => mapExistingNodes(data?.oidcProviders) ?? [],
    [data?.oidcProviders]
  )

  if (loading && !data) return <LoopingLogo />

  return (
    <div
      css={{
        border: theme.borders['fill-two'],
        borderRadius: theme.borderRadiuses.large,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'auto',
      }}
    >
      {isEmpty(oidcProviders) ? (
        <EmptyState
          message="No Plural OIDC clients found."
          css={{
            backgroundColor: theme.colors['fill-one'],
            color: theme.colors['text-light'],
            justifyContent: 'center',
            p: { ...theme.partials.text.body2 },
          }}
        />
      ) : (
        <Table
          virtualizeRows
          data={oidcProviders}
          columns={columns}
          hideHeader
          hasNextPage={pageInfo?.hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={loading}
          onVirtualSliceChange={setVirtualSlice}
          reactVirtualOptions={DEFAULT_REACT_VIRTUAL_OPTIONS}
          reactTableOptions={{
            meta: { instanceName, insideModal, refetch } as TableMetaT,
          }}
          style={{
            border: 'none',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
          css={{
            td: {
              backgroundColor:
                theme.colors[insideModal ? 'fill-two' : 'fill-one'],
              borderColor: theme.colors['border-fill-two'],
            },
          }}
        />
      )}
      <div
        onClick={() => setCreateOpen(true)}
        css={{
          ...theme.partials.text.body2Bold,
          backgroundColor: theme.colors[insideModal ? 'fill-one' : 'fill-zero'],
          alignItems: 'center',
          borderTop: theme.borders['fill-two'],
          display: 'flex',
          justifyContent: 'space-between',
          padding: theme.spacing.small,
          position: 'sticky',
          bottom: 0,
          right: 0,
          left: 0,

          '&:hover': {
            backgroundColor:
              theme.colors[insideModal ? 'fill-one-hover' : 'fill-zero-hover'],
            cursor: 'pointer',
          },
        }}
      >
        Add new Plural OIDC client
        <IconFrame icon={<PlusIcon color="icon-light" />} />
      </div>
      <EditPluralOIDCClientModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        instanceName={instanceName}
        refetch={refetch}
      />
    </div>
  )
}
