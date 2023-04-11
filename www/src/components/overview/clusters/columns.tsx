import {
  AppIcon,
  Button,
  CaretRightIcon,
  Chip,
  IconFrame,
  TerminalIcon,
} from '@pluralsh/design-system'
import styled from 'styled-components'
import { createColumnHelper } from '@tanstack/react-table'

import { ProviderIcon } from '../../utils/ProviderIcon'
import { Source } from '../../../generated/graphql'

import CopyButton from '../../utils/CopyButton'

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

export const ColCluster = columnHelper.accessor(row => row.name, {
  id: 'cluster',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { name, provider, source } } }) => (
    <CellWrap>
      <AppIcon
        size="xxsmall"
        icon={(
          <ProviderIcon
            provider={provider}
            width={16}
          />
        )}
      />
      <div>
        <div>{name}</div>
        <CellCaption>{sourceDisplayNames[source || '']}</CellCaption>
      </div>
    </CellWrap>
  ),
  header: 'Cluster',
})

export const ColHealth = columnHelper.accessor(row => row.pingedAt, {
  id: 'health',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { pingedAt } } }) => <ClusterHealth pingedAt={pingedAt} />,
  header: 'Health',
})

export const ColGit = columnHelper.accessor(row => row.gitUrl, {
  id: 'git',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { gitUrl } } }) => <CopyButton text={gitUrl || ''} />,
  header: 'Git',
})

export const ColCloudShell = columnHelper.accessor(row => row.owner?.hasShell, {
  id: 'cloudshell',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { owner } } }) => (owner?.hasShell
    ? (
      <IconFrame
        clickable
        icon={<TerminalIcon />}
        onClick={() => null} // TODO: Navigate.
        textValue="Go to cloudshell"
        tooltip
        type="floating"
      />
    )
    : null),
  header: 'Cloudshell',
})

export const ColOwner = columnHelper.accessor(row => row.owner?.name, {
  id: 'owner',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { owner } } }) => (
    <ClusterOwner
      name={owner?.name}
      email={owner?.email}
      avatar={owner?.avatar}
    />
  ),
  header: 'Owner',
})

export const ColUpgrades = columnHelper.accessor(row => row.delivered, {
  id: 'upgrades',
  enableGlobalFilter: true,
  enableSorting: true,
  cell: ({ row: { original: { delivered } } }) => (
    <Chip
      severity={delivered ? 'success' : 'warning'}
      hue="lighter"
    >
      {delivered ? 'Delivered' : 'Pending'}
    </Chip>
  ),
  header: 'Upgrades',
})

const ActionsWrap = styled(CellWrap)({ alignSelf: 'end' })

export const ColActions = navigate => (columnHelper.accessor(row => row.consoleUrl, {
  id: 'actions',
  enableGlobalFilter: false,
  enableSorting: false,
  cell: ({ row: { original: { id, consoleUrl } } }) => (
    <ActionsWrap>
      {consoleUrl && (
        <Button
          secondary
          small
          as="a"
          href={consoleUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Launch Console
        </Button>
      )}
      <IconFrame
        clickable
        size="medium"
        icon={<CaretRightIcon />}
        onClick={() => navigate(`/clusters/${id}`)}
        textValue="Go to cluster details"
        tooltip
        type="tertiary"
      />
    </ActionsWrap>
  ),
  header: '',
}))
