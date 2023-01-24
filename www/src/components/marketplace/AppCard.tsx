import {
  Div,
  Flex,
  H3,
  P,
  Span,
} from 'honorable'
import {
  AppIcon,
  Card,
  Chip,
  ComponentsIcon,
  DashboardIcon,
  GearTrainIcon,
  IdIcon,
  LogsIcon,
  PadlockLockedIcon,
  RunBookIcon,
  VerifiedIcon,
} from '@pluralsh/design-system'

import { Severity } from '@pluralsh/design-system/dist/types'

import { ComponentProps, ReactNode } from 'react'

// const SHORTCUT_URLS = SHORTCUTS.map(shortcut => shortcut.url)

// const isShortcut = url => SHORTCUT_URLS.indexOf(url) > -1

export const getBorderColor = (severity?: Severity) => {
  switch (severity) {
  case 'error':
  case 'danger':
    return 'border-error'
  case 'warning':
    return 'border-warning'
  default:
    return ''
  }
}

type AppCardProps = {
  title: ReactNode
  imageUrl: string
  publisher: string
  description: string
  tags: string[]
  appStatus?: ReactNode
  severity?: Severity
  version?: string
  rightContent?: ReactNode
  childrenProps: ComponentProps<typeof Div>
}

type MarketplaceAppCardProps = Omit<AppCardProps, 'chip'> & {
  installed?: boolean
  verified: boolean
  trending: boolean
  priv: boolean
}

export function ListItemBorder({
  color,
  width = 3,
  radius = 4,
}: {
  color: string
  width?: number
  radius?: number
}) {
  return (
    <Flex
      backgroundColor={color}
      borderTopLeftRadius={radius}
      borderBottomLeftRadius={radius}
      height="inherit"
      width={width}
    />
  )
}

export function AppCardBasicInfo({
  imageUrl,
  title,
  version,
  appStatus,
}: Pick<AppCardProps, 'imageUrl' | 'title' | 'version' | 'appStatus'>) {
  return (
    <Flex
      align="center"
      gap="small"
      flexGrow={1}
      flexBasis="40%"
      padding="medium"
    >
      {imageUrl && (
        <AppIcon
          url={imageUrl}
          size="xsmall"
        />
      )}
      <Flex direction="column">
        <Flex gap="small">
          <H3
            margin={0}
            body1
            fontWeight={600}
          >
            {title}
          </H3>
          {appStatus}
        </Flex>
        {version && <Flex>v{version}</Flex>}
      </Flex>
    </Flex>
  )
}

export function AppCard({
  title,
  imageUrl,
  version,
  appStatus,
  rightContent = <div>stuff</div>,
  children,
  severity,
  childrenProps,
  ...props
}: AppCardProps & ComponentProps<typeof Card>) {
  const borderColor = getBorderColor(severity)

  return (
    <Card
      clickable
      display="flex"
      flexGrow={1}
      flexShrink={1}
      minWidth={240}
      {...props}
    >
      {borderColor && <ListItemBorder color={borderColor} />}
      <Flex width="100%">
        <AppCardBasicInfo
          title={title}
          version={version}
          imageUrl={imageUrl}
          appStatus={appStatus}
        />
        {rightContent}
      </Flex>
      {children && <Div {...childrenProps}>{children}</Div>}
    </Card>
  )
}

export function MarketplaceAppCard({
  installed,
  title,
  verified,
  priv,
  ...props
}: MarketplaceAppCardProps) {
  const fullTitle = (
    <Flex
      alignItems="center"
      gap={3}
    >
      {title}
      {verified && (
        <VerifiedIcon
          as="div"
          color="action-link-inline"
          size={12}
          position="relative"
          top={-1.5}
        />
      )}
    </Flex>
  )

  const rightContent = (
    <Flex
      paddingTop="medium"
      paddingRight="medium"
      paddingBottom="medium"
      alignItems="center"
      height="100%"
    >
      {installed ? (
        <Chip
          severity="success"
          size="large"
          hue="lighter"
        >
          <Span fontWeight={600}>Installed</Span>
        </Chip>
      ) : undefined}
      {!!priv && (
        <Chip
          size="large"
          hue="lighter"
          marginLeft={8}
          paddingHorizontal={8}
          paddingVertical={8}
          backgroundColor="transparent"
          border="none"
        >
          <PadlockLockedIcon />
        </Chip>
      )}
    </Flex>
  )

  return (
    <AppCard
      title={fullTitle}
      rightContent={rightContent}
      {...props}
    />
  )
}
