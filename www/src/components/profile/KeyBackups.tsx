import { Box } from 'grommet'
import {
  A,
  Div,
  Flex,
  P,
} from 'honorable'
import moment from 'moment'
import { useMemo, useState } from 'react'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'

import {
  DownloadIcon,
  EmptyState,
  IconFrame,
  Modal,
  PageTitle,
} from '@pluralsh/design-system'

import isEmpty from 'lodash/isEmpty'

import { Confirm } from '../utils/Confirm'
import { DeleteIconButton } from '../utils/IconButtons'
import LoadingIndicator from '../utils/LoadingIndicator'
import { KeyBackupFragment, useDeleteKeyBackupMutation, useKeyBackupsQuery } from '../../generated/graphql'
import { Table } from '../utils/Table'

const columnHelper = createColumnHelper<KeyBackupFragment>()

const columns = [
  columnHelper.accessor(key => key.name, {
    id: 'name',
    cell: info => <>{info.getValue()}</>,
    header: 'Name',
  }),
  columnHelper.accessor(key => key.repositories, {
    id: 'repositories',
    cell: info => <>{info.getValue()}</>,
    header: 'Respositories',
  }),
  columnHelper.accessor(key => key.digest, {
    id: 'digest',
    cell: info => <>{info.getValue()}</>,
    header: 'Digest',
  }),
  columnHelper.accessor(key => key.insertedAt, {
    id: 'createdOn',
    cell: info => {
      const date = moment(info.getValue())
      const formattedDate = date.format('MM/DD/YY')
      const formattedTime = date.format('h:mm:ss a')

      return (
        <Flex direction="column">
          <Div>{formattedDate}</Div>
          <Div>{formattedTime}</Div>
        </Flex>
      )
    },
    header: 'Created on',
  }),
  columnHelper.accessor(key => key, {
    id: 'actions',
    cell: info => <>{info.getValue()}</>,
    // header: 'Name',
  }),
]

function DeleteKeyBackup({ name, refetch }) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading }] = useDeleteKeyBackupMutation({
    variables: { name },
    onCompleted: () => {
      setConfirm(false)
      refetch()
    },
  })

  return (
    <Div onClick={e => e.stopPropagation()}>
      <DeleteIconButton
        onClick={() => setConfirm(true)}
        textValue="Delete key backup"
        tooltip
      />
      {confirm && (
        <div>
          <Confirm
            close={() => setConfirm(false)}
            destructive
            label="Confirm delete"
            loading={loading}
            open={confirm}
            submit={() => mutation()}
            title="Delete encryption key backup"
            text={`Are you sure you want to delete the encryption key: ${name}?`}
          />
        </div>
      )}
    </Div>
  )
}

function LocalSyncButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <IconFrame
        textValue="Sync locally"
        tooltip
        clickable
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        icon={<DownloadIcon />}
      />
      <Modal
        open={isOpen}
        onClose={setIsOpen(false)}
      >
        Sync messaging
      </Modal>
    </>
  )
}

const ColActions = refetch => columnHelper.accessor(() => null, {
  id: 'actions',
  cell: ({ row: { original } }) => (
    <Flex
      flexDirection="row"
      gap="xxsmall"
    >
      <LocalSyncButton />
      <DeleteKeyBackup
        name={original.name}
        refetch={refetch}
      />
    </Flex>
  ),
  header: '',
})

type Edge<T> = { node?: T } | null | undefined

function mapExistingEdgeNodes<T, R>(edges: Edge<T | null | undefined>[] | null | undefined,
  mapper: (node: T) => R) {
  if (!edges) {
    return undefined
  }

  return edges.reduce((prev, edge) => {
    if (edge?.node) {
      return [...prev, mapper(edge.node)]
    }

    return prev
  }, [] as R[])
}

export function KeyBackups() {
  const {
    data, loading, fetchMore, refetch,
  } = useKeyBackupsQuery({})

  const keyBackups = mapExistingEdgeNodes(data?.keyBackups?.edges, edge => edge)

  // Memoize columns to prevent rerendering entire table
  const memoizedCols: ColumnDef<KeyBackupFragment, any>[] = useMemo(() => [...columns, ColActions(refetch)],
    [refetch])

  if (!keyBackups) return <LoadingIndicator />

  return (
    <Box fill>
      <PageTitle
        heading="Encryption keys"
        justifyContent="flex-start"
      >
        <P
          marginBottom="medium"
          maxWidth={400}
        >
          Secure cloud backups of the machine-local AES encryption keys for your
          installation repositories.{' '}
          <A
            href="https://docs.plural.sh/getting-started/manage-git-repositories/workspace-encryption"
            target="_blank"
            inline
          >
            Learn more
          </A>
        </P>
      </PageTitle>
      <Box fill>
        <P
          marginBottom="medium"
          maxWidth={400}
        >
          Secure cloud backups of the machine-local AES encryption keys for your
          installation repositories.{' '}
          <A
            href="https://docs.plural.sh/getting-started/manage-git-repositories/workspace-encryption"
            target="_blank"
            inline
          >
            Learn more
          </A>
        </P>
        {!isEmpty(keyBackups) ? (
          <Table
            loose
            data={keyBackups}
            columns={memoizedCols}
          />
        ) : (
          <EmptyState message="You do not have any encyrption key backups yet." />
        )}
      </Box>
    </Box>
  )
}
