import {
  AppIcon,
  CaretRightIcon,
  CheckRoundedIcon,
  Chip,
  ConsoleIcon,
  IconFrame,
  TerminalIcon,
} from '@pluralsh/design-system'
import styled from 'styled-components'
import { createColumnHelper } from '@tanstack/react-table'
import { Link } from 'react-router-dom'
import { A, Div } from 'honorable'

import { useState } from 'react'

import { ProviderIcon } from '../../utils/ProviderIcon'
import { Cluster, Source } from '../../../generated/graphql'
import CopyButton from '../../utils/CopyButton'

import { ClusterPromoteModal } from '../../cluster/ClusterPromoteModal'

import ClusterHealth from './ClusterHealth'
import ClusterOwner from './ClusterOwner'
import { ClusterListElement } from './types'

export const columnHelper = createColumnHelper<ClusterListElement>()

export const CellWrap = styled.div(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  gap: theme.spacing.small,
}))

export const CellCaption = styled.div(({ theme }) => ({
  ...theme.partials.text.caption,
  color: theme.colors['text-xlight'],
}))

const sourceDisplayNames = {
  [Source.Default]: 'CLI',
  [Source.Shell]: 'Cloud shell',
  [Source.Demo]: 'Demo',
}

export const ColCluster = columnHelper.accessor((row) => row.name, {
  id: 'cluster',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({
    row: {
      original: { id, name, provider, source, accessible },
    },
  }) => (
    <CellWrap>
      <AppIcon
        size="xxsmall"
        icon={
          <ProviderIcon
            provider={provider}
            width={16}
          />
        }
      />
      <div>
        {accessible ? (
          <A
            as={Link}
            to={`/clusters/${id}`}
            whiteSpace="nowrap"
          >
            {name}
          </A>
        ) : (
          <Div whiteSpace="nowrap">{name}</Div>
        )}
        <CellCaption>{sourceDisplayNames[source || '']}</CellCaption>
      </div>
    </CellWrap>
  ),
  header: 'Cluster',
})

export const ColHealth = columnHelper.accessor((row) => row.pingedAt, {
  id: 'health',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({
    row: {
      original: { pingedAt },
    },
  }) => (
    <ClusterHealth
      pingedAt={pingedAt}
      size="small"
    />
  ),
  header: 'Health',
})

export const ColGit = columnHelper.accessor((row) => row.gitUrl, {
  id: 'git',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({
    row: {
      original: { gitUrl },
    },
  }) => <CopyButton text={gitUrl || ''} />,
  header: 'Git',
})

export const ColCloudShell = columnHelper.accessor(
  (row) => row.owner?.hasShell,
  {
    id: 'cloudshell',
    enableGlobalFilter: true,
    enableSorting: true,
    cell: ({
      row: {
        original: { owner, id, accessible },
      },
    }) =>
      owner?.hasShell ? (
        accessible ? (
          <IconFrame
            clickable
            icon={<TerminalIcon />}
            // @ts-expect-error
            as={Link}
            to={`/shell?cluster=${id}`}
            textValue="Go to cloudshell"
            tooltip
            type="floating"
          />
        ) : (
          <IconFrame
            size="medium"
            icon={<TerminalIcon color="icon-disabled" />}
            textValue="You aren't an administrator of this cluster"
            tooltip
            type="floating"
          />
        )
      ) : null,
    header: 'Cloudshell',
  }
)

export const ColOwner = columnHelper.accessor((row) => row.owner?.name, {
  id: 'owner',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({
    row: {
      original: { owner },
    },
  }) => (
    <ClusterOwner
      name={owner?.name}
      email={owner?.email}
      avatar={owner?.avatar}
    />
  ),
  header: 'Owner',
})

function Promotions({ cluster }: { cluster: Cluster }): ReactElement {
  const [promoteOpen, setPromoteOpen] = useState(false)

  return (
    <>
      <IconFrame
        clickable
        onClick={() => setPromoteOpen(true)}
        icon={<CheckRoundedIcon color="icon-success" />}
        type="floating"
      />
      <ClusterPromoteModal
        open={promoteOpen}
        setOpen={setPromoteOpen}
        destination={cluster}
      />
    </>
  )
}

export const ColPromotions = columnHelper.accessor((row) => row, {
  id: 'promotions',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({
    row: {
      original: { hasDependency, raw },
    },
  }) => hasDependency && <Promotions cluster={raw} />,
  header: 'Promotions',
})

export const ColUpgrades = columnHelper.accessor((row) => row.delivered, {
  id: 'upgrades',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: (delivered) => (
    <Chip
      severity={delivered.getValue() ? 'success' : 'warning'}
      hue="lighter"
      size="small"
    >
      {delivered.getValue() ? 'Delivered' : 'Pending'}
    </Chip>
  ),
  header: 'Upgrades',
})

const ActionsWrap = styled(CellWrap)({ alignSelf: 'end' })

export const ColActions = columnHelper.accessor((row) => row.consoleUrl, {
  id: 'actions',
  enableGlobalFilter: false,
  enableSorting: false,
  cell: ({
    row: {
      original: { id, consoleUrl, accessible },
    },
  }) => (
    <ActionsWrap>
      {consoleUrl && (
        <IconFrame
          clickable
          size="medium"
          icon={<ConsoleIcon />}
          textValue="Launch Console"
          tooltip
          type="secondary"
          onClick={() => window.open(consoleUrl, '_blank')}
        />
      )}
      {accessible ? (
        <IconFrame
          clickable
          size="medium"
          icon={<CaretRightIcon />}
          // @ts-expect-error
          as={Link}
          to={`/clusters/${id}`}
          textValue="Go to cluster details"
          tooltip
          type="tertiary"
        />
      ) : (
        <IconFrame
          size="medium"
          icon={<CaretRightIcon color="icon-disabled" />}
          textValue="You aren't an administrator of this cluster"
          tooltip
          type="tertiary"
        />
      )}
    </ActionsWrap>
  ),
  header: '',
})
