import { ReactElement } from 'react'
import {
  ArrowTopRightIcon,
  Chip,
  GearTrainIcon,
  IconFrame,
  ListBoxItem,
  Tooltip,
} from '@pluralsh/design-system'
import { Flex, Span } from 'honorable'
import { useNavigate, useParams } from 'react-router-dom'

import { Repository } from '../../generated/graphql'
import { MoreMenu } from '../account/MoreMenu'

type ClusterAppProps = {
  app: Repository
  consoleUrl?: string | null
  last: boolean
}

const tooltip = (app) =>
  `The installation for this application is locked, you need to apply any manual changes then run plural repos unlock ${app}`

function SyncState({ synced }) {
  return (
    <Chip
      marginLeft="xsmall"
      severity={synced ? 'success' : 'warning'}
      size="small"
    >
      {synced ? 'Synced' : 'Pending Sync'}
    </Chip>
  )
}

function LockedBadge({ name }) {
  return (
    <Tooltip label={tooltip(name)}>
      <Chip>Locked</Chip>
    </Tooltip>
  )
}

export function ClusterApp({
  app: { name, icon, darkIcon, installation },
  consoleUrl,
  last,
}: ClusterAppProps): ReactElement {
  const navigate = useNavigate()
  const { clusterId } = useParams()

  const menuItems = {
    manageOnConsole: {
      icon: <ArrowTopRightIcon />,
      label: 'Manage on Console',
      onSelect: () => window.open(`${consoleUrl}/apps/${name}`, '_blank'),
    },
    appSettings: {
      icon: <GearTrainIcon />,
      label: 'App settings',
      onSelect: () => navigate(`/apps/${clusterId}/${name}`),
    },
  }

  return (
    <Flex
      gap="xsmall"
      align="center"
      padding="small"
      borderBottom={last ? undefined : '1px solid border'}
      cursor="pointer"
      onClick={() => navigate(`/apps/${clusterId}/${name}`)}
      _hover={{ backgroundColor: 'fill-one-hover' }}
    >
      <IconFrame
        icon={
          <img
            src={darkIcon || icon || ''}
            width={16}
            height={16}
          />
        }
        marginRight="xxsmall"
        size="medium"
        type="floating"
      />
      <Span
        body2
        fontWeight={600}
      >
        {name}
      </Span>
      <SyncState synced={installation?.synced} />
      {installation?.locked && <LockedBadge name={name} />}
      <Flex grow={1} />
      {/* <ClusterAppHealth
        pingedAt={installation?.pingedAt}
        marginHorizontal="xsmall"
      /> */}
      <MoreMenu
        onSelectionChange={(selectedKey) => menuItems[selectedKey]?.onSelect()}
        floating
      >
        {Object.entries(menuItems).map(([key, { icon, label }]) => (
          <ListBoxItem
            key={key}
            textValue={label}
            label={label}
            leftContent={icon}
            color="blue"
          />
        ))}
      </MoreMenu>
    </Flex>
  )
}
