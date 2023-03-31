import {
  A,
  Button,
  Div,
  Flex,
  P,
} from 'honorable'
import moment from 'moment'
import { useCallback, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'

import {
  Codeline,
  DownloadIcon,
  EmptyState,
  IconFrame,
  Modal,
  PageTitle,
  Table,
  Tooltip,
} from '@pluralsh/design-system'

import isEmpty from 'lodash/isEmpty'

import styled from 'styled-components'

import { Confirm } from '../utils/Confirm'
import { DeleteIconButton } from '../utils/IconButtons'
import LoadingIndicator from '../utils/LoadingIndicator'
import {
  KeyBackupFragment,
  KeyBackupsDocument,
  useCreateKeyBackupMutation,
  useDeleteKeyBackupMutation,
  useKeyBackupsQuery,
} from '../../generated/graphql'
import { GqlError } from '../utils/Alert'
import { appendConnection, removeConnection, updateCache } from '../../utils/graphql'

const columnHelper = createColumnHelper<KeyBackupFragment>()

const BareUl = styled.ul(_ => ({
  margin: 0,
  padding: 0,
  maxWidth: '400px',
}))

const BareLi = styled.li(_ => ({
  margin: 0,
  padding: 0,
  listStyle: 'none',
  maxWidth: 'max-content',
}))

const columns = [
  columnHelper.accessor(key => key.name, {
    id: 'name',
    cell: info => <>{info.getValue()}</>,
    header: 'Name',
  }),
  columnHelper.accessor(key => key.repositories, {
    id: 'repositories',
    cell: info => (
      <BareUl>
        {info.getValue()?.map(repo => (
          <Tooltip
            placement="top-start"
            label={repo}
          >
            <BareLi>{repo}</BareLi>
          </Tooltip>
        ))}
      </BareUl>
    ),
    header: 'Respositories',
    meta: { truncate: true },
  }),
  columnHelper.accessor(key => key.digest, {
    id: 'digest',
    cell: info => (
      <Tooltip
        placement="top-start"
        label={info.getValue()}
      >
        <Div maxWidth="max-content">{info.getValue()}</Div>
      </Tooltip>
    ),
    header: 'Digest',
    meta: { truncate: true },
  }),
  columnHelper.accessor(key => key.insertedAt, {
    id: 'createdOn',
    cell: info => {
      const date = moment(info.getValue())
      const formattedDate = date.format('MM/DD/YY')
      const formattedTime = date.format('h:mma')

      return (
        <Flex direction="column">
          <P body2>{formattedDate}</P>
          <P
            caption
            color="text-light"
          >
            {formattedTime}
          </P>
        </Flex>
      )
    },
    header: 'Created on',
  }),
  columnHelper.accessor(() => null, {
    id: 'actions',
    cell: ({ row: { original } }) => (
      <Flex
        flexDirection="row"
        gap="xxsmall"
      >
        <LocalSyncButton />
        <DeleteKeyBackup name={original.name} />
      </Flex>
    ),
    header: '',
  }),
]

function DeleteKeyBackup({ name }) {
  // Disable until deleteKeyBackup mutation is working
  // return null

  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading, error, reset }] = useDeleteKeyBackupMutation({
    variables: { name },
    onCompleted: () => {
      setConfirm(false)
    },
    update: (cache, { data }) => updateCache(cache, {
      query: KeyBackupsDocument,
      variables: {},
      update: prev => removeConnection(prev, data?.deleteKeyBackup, 'keyBackups'),
    }),
  })
  const open = useCallback(() => {
    setConfirm(true)
  }, [])
  const close = useCallback(() => {
    reset()
    setConfirm(false)
  }, [reset])

  return (
    <Div onClick={e => e.stopPropagation()}>
      <DeleteIconButton
        onClick={open}
        textValue="Delete key backup"
        tooltip
      />
      <div>
        <Confirm
          close={close}
          destructive
          label="Confirm delete"
          loading={loading}
          open={confirm}
          submit={() => mutation()}
          title="Delete encryption key backup"
          text={(
            <Flex
              direction="column"
              gap="medium"
            >
              <P>
                Are you sure you want to delete the encryption key backup:{' '}
                {name}?
              </P>
              {error && <GqlError error={error} />}
            </Flex>
          )}
        />
      </div>
    </Div>
  )
}

function LocalSyncButton() {
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])

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
        onClose={close}
        header="Sync encryption keys locally"
        size="large"
        portal
      >
        <Flex
          direction="column"
          gap="medium"
        >
          <P body1>
            To sync your encryption keys locally, run this command in the Plural
            CLI on your local machine:
          </P>
          <Codeline>plural crypto backups restore</Codeline>
        </Flex>
      </Modal>
    </>
  )
}

function CreateKeyButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        secondary
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Create key backup
      </Button>
      {isOpen && (
        <Modal
          open={isOpen}
          onClose={setIsOpen(false)}
        >
          Sync messaging
        </Modal>
      )}
    </>
  )
}

type Edge<T> = { node?: T } | null | undefined
type Connection<T> = {
  edges?: Edge<T | null | undefined>[] | null | undefined
}

export function mapExistingConnectionNodes<T, R>(connection: Connection<T> | null | undefined,
  mapper: (node: T) => R) {
  if (!connection?.edges) {
    return undefined
  }
  const { edges } = connection

  return edges.reduce((prev, edge) => {
    if (edge?.node) {
      return [...prev, mapper(edge.node)]
    }

    return prev
  }, [] as R[])
}

function CreateDummyKeyButton() {
  const [keyi, setkeyi] = useState(0)

  const [createMutation, { loading: createLoading }]
    = useCreateKeyBackupMutation({
      variables: {
        attributes: {
          name: `name${String(Math.trunc(keyi)).padStart(5, '0')}`,
          repositories: [
            'git@github.com:/pluralsh/plural.git',
            'git@github.com:/pluralsh/some-long-name-of-something-or-other/plural.git',
          ],
          key: `value${String(Math.trunc(keyi)).padStart(5, '0')}`,
        },
      },
      onCompleted: data => {
        console.log('completed', data)
      },
      onError: error => {
        console.log('error', error)
      },
      update: (cache, { data }) => updateCache(cache, {
        query: KeyBackupsDocument,
        variables: {},
        update: prev => appendConnection(prev, data?.createKeyBackup, 'keyBackups'),
      }),
    })

  return (
    <Button
      secondary
      loading={createLoading}
      onClick={() => {
        createMutation()
        setkeyi(keyi + 1)
      }}
    >
      Debug create
    </Button>
  )
}

export function KeyBackups() {
  const { data, error } = useKeyBackupsQuery({
    pollInterval: 10000,
  })

  const keyBackups = mapExistingConnectionNodes(data?.keyBackups,
    edge => edge)?.sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1))

  console.log('k', keyBackups)

  if (error) return <GqlError error={error} />

  if (!keyBackups) return <LoadingIndicator />

  return (
    <Flex
      direction="column"
      maxHeight="100%"
      overflow="hidden"
    >
      <PageTitle
        heading={(
          <>
            <div>Encryption keys</div>
            <P
              body2
              maxWidth={450}
              color="text-light"
            >
              Secure cloud backups of the machine-local AES encryption keys for
              your installation repositories.{' '}
              <A
                href="https://docs.plural.sh/getting-started/manage-git-repositories/workspace-encryption"
                target="_blank"
                inline
              >
                Learn more
              </A>
            </P>
          </>
        )}
        justifyContent="flex-start"
      >
        <Flex
          // height="100%"
          flexGrow={1}
          flexShrink={1}
          alignItems="flex-start"
          justifyContent="flex-end"
        >
          <CreateDummyKeyButton />
          <CreateKeyButton />
        </Flex>
      </PageTitle>
      <Flex overflow="hidden">
        {!isEmpty(keyBackups) ? (
          <Table
            loose
            data={keyBackups}
            columns={columns}
            maxHeight="100%"
          />
        ) : (
          <EmptyState message="You do not have any encryption key backups yet." />
        )}
      </Flex>
    </Flex>
  )
}
