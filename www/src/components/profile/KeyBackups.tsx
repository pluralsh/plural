import {
  A,
  Button,
  Div,
  Flex,
  P,
} from 'honorable'
import moment from 'moment'
import { ReactNode, useCallback, useState } from 'react'
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
  useDeleteKeyBackupMutation,
  useKeyBackupsQuery,
} from '../../generated/graphql'
import { GqlError } from '../utils/Alert'
import { removeConnection, updateCache } from '../../utils/graphql'
import useOnOff from '../../hooks/useOnOff'
import { ShellType, useShellType } from '../../hooks/useShellType'

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
    cell: ({ row: { original: _ } }) => (
      <Flex
        flexDirection="row"
        gap="xxsmall"
      >
        <LocalSyncButton />
        {/* Disable until delete mutation works */}
        {/* <DeleteKeyBackup name={original.name} /> */}
      </Flex>
    ),
    header: '',
  }),
]

export function DeleteKeyBackup({ name }) {
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

const shellToHelpSuffix: Record<
  ShellType,
  ReactNode
> = {
  cli: <>run this command in the Plural CLI on your local machine:</>,
  cloud: <>run this command inside of the cloud shell:</>,
  unknown: (
    <>
      run the command below on either your local machine or inside of the cloud
      shell, depending on your workspace setup:
    </>
  ),
}

function LocalSyncButton() {
  const openState = useOnOff(false)
  const shellType = useShellType()

  return (
    <>
      <IconFrame
        textValue="Sync locally"
        tooltip
        clickable
        onClick={openState.setOn}
        icon={<DownloadIcon />}
      />
      <Modal
        open={openState.on}
        onClose={openState.setOff}
        header="Sync encryption keys locally"
        size="large"
        portal
      >
        <Flex
          direction="column"
          gap="medium"
        >
          <P body1>
            To sync your encryption keys locally,{' '}
            {shellToHelpSuffix[shellType] || shellToHelpSuffix.unknown}
          </P>
          <Codeline>plural crypto backups restore</Codeline>
        </Flex>
      </Modal>
    </>
  )
}

function CreateKeyButton() {
  const openState = useOnOff(false)
  const shellType = useShellType()

  return (
    <>
      <Button
        secondary
        onClick={openState.setOn}
      >
        Create key backup
      </Button>
      <Modal
        open={openState.on}
        onClose={openState.setOff}
        header="Sync encryption keys locally"
        size="large"
        portal
      >
        <Flex
          direction="column"
          gap="medium"
        >
          <P body1>
            To create new encryption key backups,{' '}
            {shellToHelpSuffix[shellType] || shellToHelpSuffix.unknown}
          </P>
          <Codeline>plural crypto backups create</Codeline>
        </Flex>
      </Modal>
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

export function KeyBackups() {
  const { data, error } = useKeyBackupsQuery({
    pollInterval: 10000,
  })

  const keyBackups = mapExistingConnectionNodes(data?.keyBackups,
    edge => edge)?.sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1))

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
          flexGrow={1}
          flexShrink={1}
          alignItems="flex-start"
          justifyContent="flex-end"
        >
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
