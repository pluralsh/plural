import {
  Button,
  Codeline,
  DownloadIcon,
  EmptyState,
  Flex,
  IconFrame,
  Modal,
  Table,
  Tooltip,
} from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'
import isEmpty from 'lodash/isEmpty'
import moment from 'moment'
import { useState } from 'react'
import styled from 'styled-components'

import { KeyBackupFragment, useKeyBackupsQuery } from '../../generated/graphql'
import { mapExistingNodes } from '../../utils/graphql'
import { GqlError } from '../utils/Alert'
import LoadingIndicator from '../utils/LoadingIndicator'
import { Body1P, Body2P, CaptionP } from '../utils/Typography'
import { SubpageHeader } from '../utils/layout/SubpageLayout'

const columnHelper = createColumnHelper<KeyBackupFragment>()

const BareUl = styled.ul({
  margin: 0,
  padding: 0,
  maxWidth: 400,
})

const BareLi = styled.li({
  margin: 0,
  padding: 0,
  listStyle: 'none',
  maxWidth: 'max-content',
})

const columns = [
  columnHelper.accessor((key) => key.name, {
    id: 'name',
    cell: (info) => <>{info.getValue()}</>,
    header: 'Name',
  }),
  columnHelper.accessor((key) => key.repositories, {
    id: 'repositories',
    cell: (info) => (
      <BareUl>
        {info.getValue()?.map((repo) => (
          <Tooltip
            key={repo}
            placement="top-start"
            label={repo}
          >
            <BareLi>{repo}</BareLi>
          </Tooltip>
        ))}
      </BareUl>
    ),
    header: 'Repositories',
    meta: { truncate: true },
  }),
  columnHelper.accessor((key) => key.digest, {
    id: 'digest',
    cell: (info) => (
      <Tooltip
        placement="top-start"
        label={info.getValue()}
      >
        <div css={{ maxWidth: 'max-content' }}>{info.getValue()}</div>
      </Tooltip>
    ),
    header: 'Digest',
    meta: { truncate: true },
  }),
  columnHelper.accessor((key) => key.insertedAt, {
    id: 'createdOn',
    cell: (info) => {
      const date = moment(info.getValue())

      return (
        <Flex direction="column">
          <Body2P as="span">{date.format('MM/DD/YY')}</Body2P>
          <CaptionP
            as="span"
            $color="text-light"
          >
            {date.format('h:mma')}
          </CaptionP>
        </Flex>
      )
    },
    header: 'Created on',
  }),
  columnHelper.display({
    id: 'actions',
    cell: () => <LocalSyncButton />,
    header: '',
  }),
]

function CliCommandModal({
  open,
  onClose,
  header,
  action,
  command,
}: {
  open: boolean
  onClose: () => void
  header: string
  action: string
  command: string
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      header={header}
      size="large"
    >
      <Flex
        direction="column"
        gap="medium"
      >
        <Body1P>
          To {action}, run this command in the Plural CLI on your local machine:
        </Body1P>
        <Codeline>{command}</Codeline>
      </Flex>
    </Modal>
  )
}

function LocalSyncButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <IconFrame
        textValue="Sync locally"
        tooltip
        clickable
        onClick={() => setOpen(true)}
        icon={<DownloadIcon />}
      />
      <CliCommandModal
        open={open}
        onClose={() => setOpen(false)}
        header="Sync encryption keys locally"
        action="sync your encryption keys locally"
        command="plural crypto backups restore"
      />
    </>
  )
}

function CreateKeyButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        secondary
        onClick={() => setOpen(true)}
      >
        Create key backup
      </Button>
      <CliCommandModal
        open={open}
        onClose={() => setOpen(false)}
        header="Create encryption key"
        action="create new encryption key backups"
        command="plural crypto backups create"
      />
    </>
  )
}

export function KeyBackups() {
  const { data, error } = useKeyBackupsQuery({ pollInterval: 10000 })

  const keyBackups = mapExistingNodes(data?.keyBackups)?.sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  if (error) return <GqlError error={error} />
  if (!keyBackups) return <LoadingIndicator />

  return (
    <Flex
      direction="column"
      height="100%"
    >
      <SubpageHeader
        title={
          <Flex
            direction="column"
            gap="xxsmall"
          >
            Encryption keys
            <Body2P
              as="span"
              $color="text-light"
              css={{ maxWidth: 450 }}
            >
              Secure cloud backups of the machine-local AES encryption keys for
              your installation repositories.
            </Body2P>
          </Flex>
        }
      >
        <CreateKeyButton />
      </SubpageHeader>
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
  )
}
